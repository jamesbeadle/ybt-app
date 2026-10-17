import { modelTakingTask } from './modelRanges';
import type { BuildModel, BuildQueueEntry } from './buildQueue';

export type BoardColumn = { model: BuildModel; tasks: BuildQueueEntry[] };
export type BoardLayout = { columns: BoardColumn[]; unplaced: BuildQueueEntry[] };

/** One column per model, holding the tasks it takes here in queue order; the tasks no model takes stand apart. */
export function boardLayout(tasks: BuildQueueEntry[], models: BuildModel[]): BoardLayout {
	const tasksByModel = new Map<BuildModel | null, BuildQueueEntry[]>();
	for (const task of tasks) {
		const model = modelTakingTask(task, models);
		tasksByModel.set(model, [...(tasksByModel.get(model) ?? []), task]);
	}
	const columns = models.map((model) => ({ model, tasks: tasksByModel.get(model) ?? [] }));
	return { columns, unplaced: tasksByModel.get(null) ?? [] };
}
