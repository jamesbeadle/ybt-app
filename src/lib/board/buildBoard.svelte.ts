import { failureText } from '$lib/failures/failureText';
import { readRangeOverrides, saveRangeOverrides } from '$lib/desktopStore';
import { boardColumns, type BoardColumn } from './boardColumns';
import { rangesOnThisMachine, type PointRange, type RangeOverrides } from './modelRanges';
import { readBuildQueue } from './readBuildQueue';
import type { BuildModel, BuildQueue } from './buildQueue';

const emptyQueue: BuildQueue = { models: [], reviewModelId: '', tasks: [] };

export class BuildBoard {
	queue = $state<BuildQueue>(emptyQueue);
	overrides = $state<RangeOverrides>({});
	problem = $state('');
	isLoading = $state(true);

	ybtModels: BuildModel[] = $derived(this.queue.models);
	reviewModelId: string = $derived(this.queue.reviewModelId);
	models: BuildModel[] = $derived(rangesOnThisMachine(this.ybtModels, this.overrides));
	columns: BoardColumn[] = $derived(boardColumns(this.queue.tasks, this.models));

	async load(): Promise<void> {
		this.problem = '';
		this.isLoading = true;
		this.overrides = await readRangeOverrides();
		this.queue = await readBuildQueue().catch((failure: unknown) => ((this.problem = failureText(failure)), emptyQueue));
		this.isLoading = false;
	}

	async setRange(modelId: string, range: PointRange): Promise<void> {
		this.overrides = { ...this.overrides, [modelId]: range };
		await saveRangeOverrides(this.overrides);
	}

	async useYbtRange(modelId: string): Promise<void> {
		const { [modelId]: _dropped, ...kept } = this.overrides;
		this.overrides = kept;
		await saveRangeOverrides(kept);
	}
}
