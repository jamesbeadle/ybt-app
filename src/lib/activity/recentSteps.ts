export type RecentStep = {
	id: string;
	taskId: string | null;
	goalId: string | null;
	step: string;
	outcome: string;
	agent: string;
	model: string;
	note: string;
	taskTitle: string;
	goalTitle: string;
	createdAt: string;
};

const noOutcome = 'none';

export function parseRecentSteps(answer: string): RecentStep[] {
	const parsed: { steps?: RecentStep[] } = JSON.parse(answer);
	return parsed.steps ?? [];
}

/** "qwen on the Mac mini considered “Fix the date picker”: buildable." — one step as a sentence. */
export function stepSentence(step: RecentStep): string {
	const who = step.model === '' ? step.agent : `${step.agent} (${step.model})`;
	const outcome = step.outcome === noOutcome ? '' : `: ${step.outcome.replaceAll('_', ' ')}`;
	return `${who} ${step.step.replaceAll('_', ' ')} “${stepSubject(step)}”${outcome}.`;
}

export function stepSubject(step: RecentStep): string {
	if (step.taskTitle !== '') return step.taskTitle;
	if (step.goalTitle !== '') return `the goal ${step.goalTitle}`;
	return 'a task no longer there';
}
