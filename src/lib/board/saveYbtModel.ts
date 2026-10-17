import { performAction } from '$lib/ybt/ybtConnector';
import type { BuildModel } from './buildQueue';
import { validateRange } from './modelRanges';

export type YbtModelDraft = { label: string; runsOn: string; leastPoints: number; mostPoints: number };

export const buildModelLimits = { longestLabel: 80, longestRunsOn: 80 } as const;

const saveAction = 'save_build_model';

export function draftOf(model: BuildModel): YbtModelDraft {
	return { label: model.label, runsOn: model.runsOn ?? '', leastPoints: model.leastPoints, mostPoints: model.mostPoints };
}

export function isSameDraft(draft: YbtModelDraft, other: YbtModelDraft): boolean {
	return (
		draft.label === other.label &&
		draft.runsOn === other.runsOn &&
		draft.leastPoints === other.leastPoints &&
		draft.mostPoints === other.mostPoints
	);
}

export function validateYbtModel(draft: YbtModelDraft): string | null {
	const label = draft.label.trim();
	if (label === '') return 'The tier needs a name.';
	if (label.length > buildModelLimits.longestLabel) return `The name is at most ${buildModelLimits.longestLabel} characters.`;
	const runsOn = draft.runsOn.trim();
	if (runsOn.length > buildModelLimits.longestRunsOn) {
		return `The model it runs on is at most ${buildModelLimits.longestRunsOn} characters.`;
	}
	return validateRange(draft);
}

/** Asks YBT to save the tier; YBT answers with a sentence saying what it now is, or why it refused. */
export async function saveYbtModel(modelId: string, draft: YbtModelDraft): Promise<string> {
	return performAction(saveAction, {
		modelId,
		label: draft.label.trim(),
		runsOn: draft.runsOn.trim(),
		leastPoints: draft.leastPoints,
		mostPoints: draft.mostPoints
	});
}
