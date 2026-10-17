import type { BuildModel, BuildQueueEntry } from './buildQueue';

export type PointRange = { leastPoints: number; mostPoints: number };
export type RangeOverrides = Record<string, PointRange>;

export const storyPointScale = [1, 2, 3, 5, 8, 13, 21] as const;

/** YBT admin's models, with this machine's own point ranges laid over them. */
export function rangesOnThisMachine(models: BuildModel[], overrides: RangeOverrides): BuildModel[] {
	return models.map((model) => ({ ...model, ...overrides[model.modelId] }));
}

export function modelForPoints(models: BuildModel[], points: number): BuildModel | null {
	return models.find((model) => model.leastPoints <= points && points <= model.mostPoints) ?? null;
}

/** The model that takes a task here: the one named on it, or the one whose range on this machine holds its points. */
export function modelTakingTask(entry: BuildQueueEntry, models: BuildModel[]): BuildModel | null {
	const named = models.find((model) => model.modelId === entry.namedModelId);
	return named ?? modelForPoints(models, entry.storyPoints);
}

export function validateRange(range: PointRange): string | null {
	const scale: readonly number[] = storyPointScale;
	const isOnScale = scale.includes(range.leastPoints) && scale.includes(range.mostPoints);
	if (!isOnScale) return `Points must be on the scale ${storyPointScale.join(', ')}.`;
	if (range.leastPoints > range.mostPoints) return 'The least points must not be more than the most.';
	return null;
}

export function isSameRange(range: PointRange, other: PointRange): boolean {
	return range.leastPoints === other.leastPoints && range.mostPoints === other.mostPoints;
}

export function rangePhrase(range: PointRange): string {
	return `${range.leastPoints}–${range.mostPoints} points`;
}
