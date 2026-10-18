import { desktopAgentName } from '$lib/chat/systemPrompt';
import type { BuildAttempt, BuildSetup } from './buildAttempt';
import { buildOutcomes, buildRecord, failureNote, handOverNote, type BuildRecord } from './buildOutcome';
import { handOverBuild, releaseBuild } from './builderActions';
import type { ClaimedTask } from './claimedTask';

/** Hands a finished build to review, or gives a stopped one back to YBT with a note, and returns the record the screen keeps. */
export async function finishBuild(setup: BuildSetup, task: ClaimedTask, branch: string, attempt: BuildAttempt): Promise<BuildRecord> {
	const { report } = attempt;
	const isFinished = report.failedStep === null;
	if (isFinished) return handOver(setup, task, branch, attempt);
	return giveBack(setup, task, branch, attempt);
}

async function handOver(setup: BuildSetup, task: ClaimedTask, branch: string, attempt: BuildAttempt): Promise<BuildRecord> {
	const note = handOverNote(attempt.report);
	const answer = await handOverBuild(task.taskId, branch, desktopAgentName, setup.model, note);
	return buildRecord(task, branch, attempt.report, buildOutcomes.handedToReview, note, answer);
}

/** A build that stopped in the shell is handed up to the next tier; one that never reached the shell is only given back. */
async function giveBack(setup: BuildSetup, task: ClaimedTask, branch: string, attempt: BuildAttempt): Promise<BuildRecord> {
	const note = failureNote(attempt.report, branch, attempt.lastLines);
	const nextModelId = attempt.hasReachedShell ? setup.nextTierModelId : '';
	const answer = await releaseBuild(task.taskId, desktopAgentName, setup.model, note, nextModelId);
	return buildRecord(task, branch, attempt.report, buildOutcomes.released, note, answer);
}
