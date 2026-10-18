/** The task YBT hands the local builder, read out of next_buildable_task's answer. */
export type ClaimedTask = {
	taskId: string;
	title: string;
	storyPoints: number;
	projectName: string;
	repositoryUrl: string;
	defaultBranch: string;
	text: string;
};

const nothingWaitingStart = 'Nothing is waiting';
const claimedForLine = /^Claimed for .*\n/;
const headlinePattern = /^(.+) — \w+ task, .*?(\d+) points, \d+% done \(id: ([0-9a-f-]{36})\)$/m;
const projectPattern = /^Project: (.+) \(id: [0-9a-f-]{36}\)$/m;
const codePattern = /^Code: (\S+) \(deploys from (\S+)\)\.$/m;

/** The claimed task, or null when YBT says nothing is waiting; a shape the builder cannot read throws. */
export function parseClaimedTask(answer: string): ClaimedTask | null {
	if (answer.startsWith(nothingWaitingStart)) return null;
	const text = answer.replace(claimedForLine, '');
	const headline = headlinePattern.exec(text);
	const project = projectPattern.exec(text);
	if (headline === null || project === null) throw unreadableAnswer(answer);
	const [, title, storyPoints, taskId] = headline;
	const code = codePattern.exec(text);
	return {
		taskId,
		title,
		storyPoints: Number(storyPoints),
		projectName: project[1],
		repositoryUrl: code === null ? '' : code[1],
		defaultBranch: code === null ? '' : code[2],
		text
	};
}

function unreadableAnswer(answer: string): Error {
	const [firstLine] = answer.split('\n');
	return new Error(`YBT answered in a shape the builder cannot read: ${firstLine}`);
}
