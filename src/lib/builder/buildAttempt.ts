import type { BuildReport } from './buildOutcome';
import { buildRefusal, buildStages, type BuildRefusal } from './buildStage';
import type { ClaimedTask } from './claimedTask';

/** What the app's shell is asked to build: the repository and branch, the task, and the local model that writes the code. */
export type BuildRequest = {
	buildsFolder: string;
	repositoryUrl: string;
	defaultBranch: string;
	branch: string;
	taskTitle: string;
	taskText: string;
	model: string;
	lmStudioOrigin: string;
};

const stepsBeforeTheShell = { findingRepository: 'Finding the repository', startingBuild: 'Starting the build' } as const;
const noRepository: BuildRefusal = {
	reason: 'The project has no repository recorded in YBT, so there is nothing to check out.',
	stage: buildStages.task
};

export type BuildSetup = {
	lmStudioOrigin: string;
	buildsFolder: string;
	model: string;
	tierModelId: string;
	nextTierModelId: string;
};

/** How one build attempt ended: the shell's report and the last lines of the step that stopped it. */
export type BuildAttempt = { report: BuildReport; lastLines: string[] };

export function buildRequest(setup: BuildSetup, task: ClaimedTask, branch: string): BuildRequest {
	return {
		buildsFolder: setup.buildsFolder,
		repositoryUrl: task.repositoryUrl,
		defaultBranch: task.defaultBranch,
		branch,
		taskTitle: task.title,
		taskText: task.text,
		model: setup.model,
		lmStudioOrigin: setup.lmStudioOrigin
	};
}

/** The attempt of a build that never got going: stopped by the step named, for the refusal's reason and at its stage, with nothing kept. */
export function stoppedBefore(step: string, refusal: BuildRefusal): BuildAttempt {
	const { reason, stage } = refusal;
	const report: BuildReport = {
		checkout: '',
		failedStep: step,
		failedStage: stage,
		commitCount: 0,
		diffStat: '',
		isPushed: false
	};
	return { report, lastLines: [reason] };
}

/** The attempt of a task whose project has no repository in YBT: the task's own fault, so it is set aside rather than handed up. */
export function stoppedForNoRepository(): BuildAttempt {
	return stoppedBefore(stepsBeforeTheShell.findingRepository, noRepository);
}

/** The attempt of a build the app's shell refused to start, at the stage its refusal names. */
export function refusedAtStart(failure: unknown): BuildAttempt {
	return stoppedBefore(stepsBeforeTheShell.startingBuild, buildRefusal(failure));
}
