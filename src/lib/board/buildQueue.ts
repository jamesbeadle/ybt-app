export type BuildModel = { modelId: string; label: string; runsOn?: string; leastPoints: number; mostPoints: number };

export type BuildQueueEntry = {
	taskId: string;
	title: string;
	projectId: string;
	projectName: string;
	storyPoints: number;
	modelId: string | null;
	namedModelId: string | null;
	isAutocomplete: boolean;
	isWaiting: boolean;
	queuePlace: number | null;
	latestStep: string | null;
	heldBy: string | null;
};

export type BuildQueue = {
	models: BuildModel[];
	reviewModelId: string;
	canEditModels: boolean;
	tasks: BuildQueueEntry[];
};

export const emptyBuildQueue: BuildQueue = { models: [], reviewModelId: '', canEditModels: false, tasks: [] };

export function parseBuildQueue(answer: string): BuildQueue {
	const parsed: Partial<BuildQueue> = JSON.parse(answer);
	return {
		models: parsed.models ?? emptyBuildQueue.models,
		reviewModelId: parsed.reviewModelId ?? emptyBuildQueue.reviewModelId,
		canEditModels: parsed.canEditModels ?? emptyBuildQueue.canEditModels,
		tasks: parsed.tasks ?? emptyBuildQueue.tasks
	};
}
