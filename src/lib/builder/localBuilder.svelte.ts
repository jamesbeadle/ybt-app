import { invoke } from '@tauri-apps/api/core';
import { desktopAgentName } from '$lib/chat/systemPrompt';
import { failureText } from '$lib/failures/failureText';
import { StepFeed } from '$lib/steps/stepFeed.svelte';
import { buildRequest, stoppedBefore, type BuildAttempt, type BuildSetup } from './buildAttempt';
import { buildOutcomes, buildRecord, failureNote, handOverNote, type BuildRecord, type BuildReport } from './buildOutcome';
import { claimNextTask, handOverBuild, releaseBuild } from './builderActions';
import { parseClaimedTask, type ClaimedTask } from './claimedTask';
import { longestHistory, saveBuildHistory } from './builderStore';
import { taskBranchName } from './taskBranchName';

const buildCommand = 'run_local_build';
const tailLength = 40;
const stepsBeforeTheShell = { findingRepository: 'Finding the repository', startingBuild: 'Starting the build' } as const;
const noRepositoryNote = 'The project has no repository recorded in YBT, so there is nothing to check out.';

export const nothingWaitingNotice = 'Nothing is waiting for the local model.';

export type CurrentBuild = { task: ClaimedTask; branch: string };

/** The loop that takes the local model's next task from YBT, builds it on a branch, and hands it on or gives it back. */
export class LocalBuilder {
	feed = new StepFeed();
	history = $state<BuildRecord[]>([]);
	current = $state<CurrentBuild | null>(null);
	isBuilding = $state(false);
	isKeepingGoing = $state(false);
	problem = $state('');
	notice = $state('');

	constructor(
		history: BuildRecord[],
		private readonly setup: () => BuildSetup
	) {
		this.history = history;
	}

	/** Builds one task; true when it was handed to review, false when nothing waited, it was given back, or the loop broke. */
	async buildNext(): Promise<boolean> {
		this.problem = '';
		this.notice = '';
		this.isBuilding = true;
		const isHandedOver = await this.claimAndBuild().catch((failure: unknown) => ((this.problem = failureText(failure)), false));
		this.isBuilding = false;
		return isHandedOver;
	}

	async keepGoing(): Promise<void> {
		this.isKeepingGoing = true;
		let isHandedOver = true;
		while (this.isKeepingGoing && isHandedOver) isHandedOver = await this.buildNext();
		this.isKeepingGoing = false;
	}

	stop(): void {
		this.isKeepingGoing = false;
	}

	private async claimAndBuild(): Promise<boolean> {
		const setup = this.setup();
		const task = parseClaimedTask(await claimNextTask(setup.tierModelId, desktopAgentName));
		if (task === null) return (this.notice = nothingWaitingNotice), false;
		const branch = taskBranchName(task.title);
		this.current = { task, branch };
		this.feed.clear();
		const attempt = await this.attempt(setup, task, branch);
		const { report } = attempt;
		const isHandedOver = report.failedStep === null;
		if (isHandedOver) await this.handOver(setup, task, branch, report);
		if (!isHandedOver) await this.giveBack(setup, task, branch, attempt);
		this.current = null;
		return isHandedOver;
	}

	private async attempt(setup: BuildSetup, task: ClaimedTask, branch: string): Promise<BuildAttempt> {
		if (task.repositoryUrl === '') return stoppedBefore(stepsBeforeTheShell.findingRepository, noRepositoryNote);
		const request = buildRequest(setup, task, branch);
		return invoke<BuildReport>(buildCommand, { request, onEvent: this.feed.channel() })
			.then((report) => ({ report, lastLines: this.feed.lastLinesOf(report.failedStep ?? '', tailLength) }))
			.catch((failure: unknown) => stoppedBefore(stepsBeforeTheShell.startingBuild, failureText(failure)));
	}

	private async handOver(setup: BuildSetup, task: ClaimedTask, branch: string, report: BuildReport): Promise<void> {
		const note = handOverNote(report);
		const answer = await handOverBuild(task.taskId, branch, desktopAgentName, setup.model, note);
		await this.remember(buildRecord(task, branch, report, buildOutcomes.handedToReview, note, answer));
	}

	private async giveBack(setup: BuildSetup, task: ClaimedTask, branch: string, attempt: BuildAttempt): Promise<void> {
		const note = failureNote(attempt.report, branch, attempt.lastLines);
		const answer = await releaseBuild(task.taskId, desktopAgentName, setup.model, note, setup.nextTierModelId);
		await this.remember(buildRecord(task, branch, attempt.report, buildOutcomes.released, note, answer));
	}

	private async remember(record: BuildRecord): Promise<void> {
		this.history = [record, ...this.history].slice(0, longestHistory);
		await saveBuildHistory(this.history);
	}
}
