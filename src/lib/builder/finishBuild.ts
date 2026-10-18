import { desktopAgentName } from '$lib/chat/systemPrompt';
import { failureText } from '$lib/failures/failureText';
import type { BuildAttempt, BuildSetup } from './buildAttempt';
import { buildOutcomes, buildRecord, failureNote, handOverNote, refusedHandOverNote, type BuildRecord } from './buildOutcome';
import { buildStages } from './buildStage';
import { handOverBuild, releaseBuild, setAsideBuild } from './builderActions';
import type { ClaimedTask } from './claimedTask';

/**
 * Hands a finished build to review, sets aside a task the builder cannot start from what YBT records, or gives a stopped
 * build back with a note, and returns the record the screen keeps.
 */
export async function finishBuild(setup: BuildSetup, task: ClaimedTask, branch: string, attempt: BuildAttempt): Promise<BuildRecord> {
	const { failedStep, failedStage } = attempt.report;
	const isFinished = failedStep === null;
	if (isFinished) return handOver(setup, task, branch, attempt);
	const isTaskAtFault = failedStage === buildStages.task;
	if (isTaskAtFault) return setAside(setup, task, branch, attempt);
	return giveBack(setup, task, branch, attempt);
}

/** A pushed branch YBT will not take for review is given back without a hand-up, so the claim does not hold the task. */
async function handOver(setup: BuildSetup, task: ClaimedTask, branch: string, attempt: BuildAttempt): Promise<BuildRecord> {
	const note = handOverNote(attempt.report);
	return handOverBuild(task.taskId, branch, desktopAgentName, setup.model, note)
		.then((answer) => buildRecord(task, branch, attempt.report, buildOutcomes.handedToReview, note, answer))
		.catch((failure: unknown) => giveBackRefusedBranch(setup, task, branch, attempt, failureText(failure)));
}

async function giveBackRefusedBranch(
	setup: BuildSetup,
	task: ClaimedTask,
	branch: string,
	attempt: BuildAttempt,
	reason: string
): Promise<BuildRecord> {
	const note = refusedHandOverNote(branch, reason);
	const answer = await releaseBuild(task.taskId, desktopAgentName, setup.model, note, '').catch(failureText);
	return buildRecord(task, branch, attempt.report, buildOutcomes.released, note, answer);
}

async function setAside(setup: BuildSetup, task: ClaimedTask, branch: string, attempt: BuildAttempt): Promise<BuildRecord> {
	const note = failureNote(attempt.report, branch, attempt.lastLines);
	const answer = await setAsideBuild(task.taskId, desktopAgentName, setup.model, note);
	return buildRecord(task, branch, attempt.report, buildOutcomes.setAside, note, answer);
}

/** A build whose work fell short is handed up to the next tier; one stopped by this computer's set-up is only given back. */
async function giveBack(setup: BuildSetup, task: ClaimedTask, branch: string, attempt: BuildAttempt): Promise<BuildRecord> {
	const { report, lastLines } = attempt;
	const note = failureNote(report, branch, lastLines);
	const isWorkAtFault = report.failedStage === buildStages.work;
	const nextModelId = isWorkAtFault ? setup.nextTierModelId : '';
	const answer = await releaseBuild(task.taskId, desktopAgentName, setup.model, note, nextModelId);
	return buildRecord(task, branch, report, buildOutcomes.released, note, answer);
}
