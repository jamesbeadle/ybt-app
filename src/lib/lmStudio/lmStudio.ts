export type Fetcher = typeof fetch;

type ModelList = { data?: { id: string }[] };

const modelsPath = '/v1/models';

export async function listLocalModels(fetcher: Fetcher, lmStudioOrigin: string): Promise<string[]> {
	const response = await fetcher(`${lmStudioOrigin}${modelsPath}`);
	if (!response.ok) throw new Error(`LM Studio answered ${response.status}.`);
	const models: ModelList = await response.json();
	return (models.data ?? []).map((model) => model.id);
}
