import { performAction } from '$lib/ybt/ybtConnector';
import { confirmedHandOver, confirmedHandUp, confirmedRelease, confirmedSetAside } from './ybtAnswers';

const actions = {
	nextBuildableTask: 'next_buildable_task',
	submitLocalBuild: 'submit_local_build',
	recordLifecycleStep: 'record_lifecycle_step',
	setTaskBuildable: 'set_task_buildable'
} as const;
const lifecycleSteps = { released: 'released', considered: 'considered', building: 'building' } as const;
const needsInfrastructure = 'needs_infrastructure';
const stillBuildingNote = 'Still building on the local model.';

/** Claims the next task YBT holds for a model, under the agent's name; the answer is the claim or that nothing waits. */
export function claimNextTask(modelId: string, agent: string): Promise<string> {
	return performAction(actions.nextBuildableTask, { modelId, agent });
}

/** Records the branch as built and hands it to the review model, which raises the review task; a refusal is raised. */
export async function handOverBuild(taskId: string, branch: string, agent: string, model: string, note: string): Promise<string> {
	const answer = await performAction(actions.submitLocalBuild, { taskId, branch, agent, model, note });
	return confirmedHandOver(answer, branch);
}

/** Gives the task up with a note, then points it at the next tier when there is one, so a cloud model takes it; a refusal is raised. */
export async function releaseBuild(
	taskId: string,
	agent: string,
	model: string,
	note: string,
	nextModelId: string
): Promise<string> {
	const releaseAnswer = await performAction(actions.recordLifecycleStep, { taskId, step: lifecycleSteps.released, agent, model, note });
	const released = confirmedRelease(releaseAnswer);
	if (nextModelId === '') return released;
	const handUpAnswer = await performAction(actions.setTaskBuildable, { taskId, isBuildable: true, modelId: nextModelId });
	return `${released} ${confirmedHandUp(handUpAnswer, nextModelId)}`;
}

/** Sets aside a task the builder cannot start from what YBT records, as needing an infrastructure change, which takes it off the queue. */
export async function setAsideBuild(taskId: string, agent: string, model: string, note: string): Promise<string> {
	const step = { taskId, step: lifecycleSteps.considered, outcome: needsInfrastructure, agent, model, note };
	const answer = await performAction(actions.recordLifecycleStep, step);
	return confirmedSetAside(answer);
}

/** Records the build as still going, so YBT keeps the claim through a build longer than its lease. */
export function renewClaim(taskId: string, agent: string, model: string): Promise<string> {
	const step = { taskId, step: lifecycleSteps.building, agent, model, note: stillBuildingNote };
	return performAction(actions.recordLifecycleStep, step);
}
