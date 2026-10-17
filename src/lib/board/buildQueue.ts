export type BuildModel = { modelId: string; label: string; leastPoints: number; mostPoints: number };

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

export type BuildQueue = { models: BuildModel[]; reviewModelId: string; tasks: BuildQueueEntry[] };

export function parseBuildQueue(answer: string): BuildQueue {
	const parsed: Partial<BuildQueue> = JSON.parse(answer);
	return { models: parsed.models ?? [], reviewModelId: parsed.reviewModelId ?? '', tasks: parsed.tasks ?? [] };
}
