export type YbtAccount = { email: string; standing: string; projects: string };

const emailLabel = 'Email';
const standingLabel = 'Standing';
const projectsLabel = 'Projects';
const labelSeparator = ': ';

/** Reads the labelled lines who_am_i answers with: Email, Standing and Projects. */
export function parseAccount(answer: string): YbtAccount {
	const lines = new Map(answer.split('\n').map(splitLabelledLine));
	return {
		email: lines.get(emailLabel) ?? answer.trim(),
		standing: lines.get(standingLabel) ?? '',
		projects: lines.get(projectsLabel) ?? ''
	};
}

function splitLabelledLine(line: string): [string, string] {
	const separatorAt = line.indexOf(labelSeparator);
	if (separatorAt < 0) return [line.trim(), ''];
	return [line.slice(0, separatorAt).trim(), line.slice(separatorAt + labelSeparator.length).trim()];
}
