import { invoke } from '@tauri-apps/api/core';
import { failureText } from '$lib/failures/failureText';
import { StepFeed } from '$lib/steps/stepFeed.svelte';
import { buildRequest, stoppedBefore, type BuildAttempt, type BuildSetup } from './buildAttempt';
import { buildOutcomes, type BuildRecord, type BuildReport } from './buildOutcome';
import { longestHistory, readBuildHistory, saveBuildHistory } from './builderStore';
import { claimTask } from './claimTask';
import type { ClaimedTask } from './claimedTask';
import { finishBuild } from './finishBuild';
import { taskBranchName } from './taskBranchName';

const buildCommand = 'run_local_build';
const tailLength = 40;
const stepsBeforeTheShell = { findingRepository: 'Finding the repository', startingBuild: 'Starting the build' } as const;
const noRepositoryNote = 'The project has no repository recorded in YBT, so there is nothing to check out.';
const nothingWaitingNotice = 'Nothing is waiting for the local model.';

export type CurrentBuild = { task: ClaimedTask; branch: string };

/** The loop that takes the local model's next task from YBT, builds it on a branch, and hands it on or gives it back. */
export class LocalBuilder {
	feed = new StepFeed();
	history = $state<BuildRecord[]>([]);
	hasLoaded = $state(false);
	current = $state<CurrentBuild | null>(null);
	isBuilding = $state(false);
	isKeepingGoing = $state(false);
	problem = $state('');
	notice = $state('');

	/** Reads the branches built here once; the Builder screen calls it whenever it opens and finds any running build again. */
	async load(): Promise<void> {
		if (this.hasLoaded) return;
		this.history = await readBuildHistory();
		this.hasLoaded = true;
	}

	/** Builds one task; true when it was handed to review, false when nothing waited, it was given back, or one is building already. */
	async buildNext(setup: BuildSetup): Promise<boolean> {
		if (this.isBuilding) return false;
		this.problem = '';
		this.notice = '';
		this.isBuilding = true;
		const isHandedOver = await this.claimAndBuild(setup).catch((failure: unknown) => ((this.problem = failureText(failure)), false));
		this.isBuilding = false;
		return isHandedOver;
	}

	/** Builds task after task, reading the set-up afresh each time, until a build is not handed over or stop is pressed. */
	async keepGoing(setup: () => BuildSetup): Promise<void> {
		if (this.isBuilding) return;
		this.isKeepingGoing = true;
		let isHandedOver = true;
		while (this.isKeepingGoing && isHandedOver) {
			const nextSetup = setup();
			isHandedOver = await this.buildNext(nextSetup);
		}
		this.isKeepingGoing = false;
	}

	stop(): void {
		this.isKeepingGoing = false;
	}

	private async claimAndBuild(setup: BuildSetup): Promise<boolean> {
		const task = await claimTask(setup);
		if (task === null) return (this.notice = nothingWaitingNotice), false;
		const branch = taskBranchName(task.title);
		this.current = { task, branch };
		this.feed.clear();
		try {
			const attempt = await this.attempt(setup, task, branch);
			const record = await finishBuild(setup, task, branch, attempt);
			await this.remember(record);
			return record.outcome === buildOutcomes.handedToReview;
		} finally {
			this.current = null;
		}
	}

	private async attempt(setup: BuildSetup, task: ClaimedTask, branch: string): Promise<BuildAttempt> {
		if (task.repositoryUrl === '') return stoppedBefore(stepsBeforeTheShell.findingRepository, noRepositoryNote);
		const request = buildRequest(setup, task, branch);
		return invoke<BuildReport>(buildCommand, { request, onEvent: this.feed.channel() })
			.then((report) => ({ report, lastLines: this.feed.lastLinesOf(report.failedStep ?? '', tailLength), hasReachedShell: true }))
			.catch((failure: unknown) => stoppedBefore(stepsBeforeTheShell.startingBuild, failureText(failure)));
	}

	private async remember(record: BuildRecord): Promise<void> {
		this.history = [record, ...this.history].slice(0, longestHistory);
		await saveBuildHistory(this.history);
	}
}

/** The one builder the app runs, so a build carries on while its screen is away and the screen finds it again on return. */
export const localBuilder = new LocalBuilder();
