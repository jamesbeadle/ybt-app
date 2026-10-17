import type { BuildQueueEntry } from './buildQueue';

export type TaskStanding = { isFree: boolean; sentence: string };

export function taskStanding(task: BuildQueueEntry): TaskStanding {
	if (task.heldBy !== null) return { isFree: false, sentence: `Held by ${task.heldBy}` };
	if (task.isWaiting) return { isFree: false, sentence: 'Waiting for an earlier step' };
	if (!task.isAutocomplete) return { isFree: false, sentence: 'Autocomplete is off, so no AI takes it unattended' };
	return { isFree: true, sentence: 'Free to take' };
}

export function taskPlaceLine(task: BuildQueueEntry): string {
	const place = task.queuePlace === null ? 'not in the queue' : `#${task.queuePlace} in the queue`;
	const step = task.latestStep === null ? 'no AI step yet' : `last step ${task.latestStep}`;
	return `${task.projectName} · ${task.storyPoints} points · ${place} · ${step}`;
}
