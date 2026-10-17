import type { Fetcher } from './lmStudio';

export type ServedModel = {
	id: string;
	isLoaded: boolean;
	kind: string;
	quantization: string;
	contextLength: number;
};

type NativeModel = {
	id: string;
	state?: string;
	type?: string;
	quantization?: string;
	max_context_length?: number;
};

const nativeModelsPath = '/api/v0/models';
const loadedState = 'loaded';

/** Every model LM Studio has, from its native API, which says which are loaded into memory now. */
export async function listServedModels(fetcher: Fetcher, lmStudioOrigin: string): Promise<ServedModel[]> {
	const response = await fetcher(`${lmStudioOrigin}${nativeModelsPath}`);
	if (!response.ok) throw new Error(`LM Studio answered ${response.status}.`);
	const answer: { data?: NativeModel[] } = await response.json();
	return (answer.data ?? []).map(servedModel);
}

export function servedModel(model: NativeModel): ServedModel {
	return {
		id: model.id,
		isLoaded: model.state === loadedState,
		kind: model.type ?? '',
		quantization: model.quantization ?? '',
		contextLength: model.max_context_length ?? 0
	};
}

export function loadedFirst(models: ServedModel[]): ServedModel[] {
	return [...models].sort((first, second) => Number(second.isLoaded) - Number(first.isLoaded));
}
