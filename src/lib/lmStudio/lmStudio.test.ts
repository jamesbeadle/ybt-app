import { describe, expect, it } from 'vitest';
import { listLocalModels } from './lmStudio';

describe('listLocalModels', () => {
	it('lists the ids of the models LM Studio serves', async () => {
		const fetcher: typeof fetch = async () =>
			new Response(JSON.stringify({ data: [{ id: 'qwen3.6-35b-a3b' }, { id: 'text-embedding' }] }));
		expect(await listLocalModels(fetcher, 'http://127.0.0.1:1234')).toEqual(['qwen3.6-35b-a3b', 'text-embedding']);
	});

	it('says so when LM Studio refuses', async () => {
		const fetcher: typeof fetch = async () => new Response('', { status: 500 });
		await expect(listLocalModels(fetcher, 'http://127.0.0.1:1234')).rejects.toThrow('LM Studio answered 500.');
	});
});
