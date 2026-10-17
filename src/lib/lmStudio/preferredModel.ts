const embeddingMarker = 'embed';
const officeModelMarker = 'qwen';

export function chatModels(models: string[]): string[] {
	return models.filter((model) => !model.includes(embeddingMarker));
}

export function preferredModel(models: string[]): string {
	const candidates = chatModels(models);
	return candidates.find((model) => model.includes(officeModelMarker)) ?? candidates[0] ?? '';
}
