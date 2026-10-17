import { modelTakingTask } from './modelRanges';
import type { BuildModel, BuildQueueEntry } from './buildQueue';

export type BoardColumn = { model: BuildModel | null; tasks: BuildQueueEntry[] };

/** One column per model, holding the tasks it takes here in queue order, then the tasks no model takes. */
export function boardColumns(tasks: BuildQueueEntry[], models: BuildModel[]): BoardColumn[] {
	const tasksByModel = new Map<BuildModel | null, BuildQueueEntry[]>();
	for (const task of tasks) {
		const model = modelTakingTask(task, models);
		tasksByModel.set(model, [...(tasksByModel.get(model) ?? []), task]);
	}
	const columns = models.map((model) => ({ model, tasks: tasksByModel.get(model) ?? [] }));
	const unplaced = tasksByModel.get(null) ?? [];
	return unplaced.length > 0 ? [...columns, { model: null, tasks: unplaced }] : columns;
}
