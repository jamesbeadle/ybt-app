import { performAction } from '$lib/ybt/ybtConnector';

const actions = {
	nextBuildableTask: 'next_buildable_task',
	submitLocalBuild: 'submit_local_build',
	recordLifecycleStep: 'record_lifecycle_step',
	setTaskBuildable: 'set_task_buildable'
} as const;
const releasedStep = 'released';

/** Claims the next task YBT holds for a model, under the agent's name; the answer is the claim or that nothing waits. */
export function claimNextTask(modelId: string, agent: string): Promise<string> {
	return performAction(actions.nextBuildableTask, { modelId, agent });
}

/** Records the branch as built and hands it to the review model, which raises the review task. */
export function handOverBuild(taskId: string, branch: string, agent: string, model: string, note: string): Promise<string> {
	return performAction(actions.submitLocalBuild, { taskId, branch, agent, model, note });
}

/** Gives the task up with a note, then points it at the next tier when there is one, so a cloud model takes it. */
export async function releaseBuild(
	taskId: string,
	agent: string,
	model: string,
	note: string,
	nextModelId: string
): Promise<string> {
	const answer = await performAction(actions.recordLifecycleStep, { taskId, step: releasedStep, agent, model, note });
	if (nextModelId === '') return answer;
	await performAction(actions.setTaskBuildable, { taskId, isBuildable: true, modelId: nextModelId });
	return answer;
}
