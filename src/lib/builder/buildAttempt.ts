import type { BuildReport } from './buildOutcome';
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

/** The attempt of a build that never reached the shell: stopped by the step named, for the reason given, with nothing kept. */
export function stoppedBefore(step: string, reason: string): BuildAttempt {
	const report: BuildReport = { checkout: '', failedStep: step, commitCount: 0, diffStat: '', isPushed: false };
	return { report, lastLines: [reason] };
}
