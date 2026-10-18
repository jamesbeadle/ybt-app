import type { BuildModel } from '$lib/board/buildQueue';

/** The tier with the smallest tasks: the one the local model builds. */
export function localTierModel(models: BuildModel[]): BuildModel | null {
	const [lowest] = [...models].sort((model, other) => model.leastPoints - other.leastPoints);
	return lowest ?? null;
}

/** The next tier up from a model, which takes over a task that model could not build. */
export function tierAbove(models: BuildModel[], modelId: string): BuildModel | null {
	const current = models.find((model) => model.modelId === modelId);
	if (current === undefined) return null;
	const higher = models.filter((model) => model.leastPoints > current.leastPoints);
	return localTierModel(higher);
}

/** The tier this machine builds for: the chosen one while YBT still lists it, otherwise the local tier. */
export function chosenTier(models: BuildModel[], chosenId: string): string {
	const isListed = models.some((model) => model.modelId === chosenId);
	if (isListed) return chosenId;
	const local = localTierModel(models);
	return local === null ? '' : local.modelId;
}

/** The tier a failed build is handed up to: the one above, or the review model when the chosen tier is already the top. */
export function escalationTier(models: BuildModel[], modelId: string, reviewModelId: string): BuildModel | null {
	const above = tierAbove(models, modelId);
	if (above !== null) return above;
	return models.find((model) => model.modelId === reviewModelId && model.modelId !== modelId) ?? null;
}
