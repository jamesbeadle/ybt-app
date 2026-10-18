import type { ClaimedTask } from './claimedTask';

export const buildOutcomes = { handedToReview: 'handedToReview', released: 'released' } as const;

export type BuildOutcome = (typeof buildOutcomes)[keyof typeof buildOutcomes];

/** What the app's shell reports when a local build stops: where it ran and what the branch holds. */
export type BuildReport = {
	checkout: string;
	failedStep: string | null;
	commitCount: number;
	diffStat: string;
	isPushed: boolean;
};

/** One finished build as the Builder screen remembers it. */
export type BuildRecord = {
	taskId: string;
	title: string;
	projectName: string;
	branch: string;
	compareUrl: string;
	diffStat: string;
	commitCount: number;
	outcome: BuildOutcome;
	note: string;
	ybtAnswer: string;
	finishedAt: string;
};

const longestNote = 2000;
const gitHubRepository = /github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/;

/** The GitHub page comparing the branch with the default branch, or nothing when the repository is not on GitHub. */
export function branchCompareUrl(repositoryUrl: string, defaultBranch: string, branch: string): string {
	const match = gitHubRepository.exec(repositoryUrl);
	if (match === null) return '';
	const [, owner, repository] = match;
	return `https://github.com/${owner}/${repository}/compare/${defaultBranch}...${branch}`;
}

export function commitPhrase(commitCount: number): string {
	return commitCount === 1 ? '1 commit' : `${commitCount} commits`;
}

/** The note left on a task the local model could not finish: which step failed, what was kept, and the last output. */
export function failureNote(report: BuildReport, branch: string, lastLines: string[]): string {
	const lead = `${report.failedStep} failed in the YBT desktop app's local build. ${keptWorkSentence(report, branch)} Last output:\n`;
	const output = lastLines.join('\n');
	const room = Math.max(longestNote - lead.length, 0);
	return `${lead}${output.slice(Math.max(output.length - room, 0))}`;
}

export function handOverNote(report: BuildReport): string {
	return `Built by the YBT desktop app on the local model: ${commitPhrase(report.commitCount)}, checked and pushed.`;
}

export function buildRecord(
	task: ClaimedTask,
	branch: string,
	report: BuildReport,
	outcome: BuildOutcome,
	note: string,
	ybtAnswer: string
): BuildRecord {
	const compareUrl = report.isPushed ? branchCompareUrl(task.repositoryUrl, task.defaultBranch, branch) : '';
	return {
		taskId: task.taskId,
		title: task.title,
		projectName: task.projectName,
		branch,
		compareUrl,
		diffStat: report.diffStat,
		commitCount: report.commitCount,
		outcome,
		note,
		ybtAnswer,
		finishedAt: new Date().toISOString()
	};
}

function keptWorkSentence(report: BuildReport, branch: string): string {
	if (report.commitCount === 0) return 'Nothing was committed, so the next attempt starts afresh.';
	const whereabouts = report.isPushed ? 'pushed to origin' : 'not pushed';
	return `The branch ${branch} in ${report.checkout} keeps ${commitPhrase(report.commitCount)}, ${whereabouts}.`;
}
