import { describe, expect, it } from 'vitest';
import { loadedFirst, servedModel } from './servedModels';

describe('servedModel', () => {
	it('reads whether a model is loaded and how it is built', () => {
		const model = servedModel({ id: 'qwen', state: 'loaded', type: 'llm', quantization: '4bit', max_context_length: 32768 });
		expect(model).toEqual({ id: 'qwen', isLoaded: true, kind: 'llm', quantization: '4bit', contextLength: 32768 });
	});

	it('puts loaded models first', () => {
		const idle = servedModel({ id: 'idle', state: 'not-loaded' });
		const loaded = servedModel({ id: 'loaded', state: 'loaded' });
		expect(loadedFirst([idle, loaded]).map((model) => model.id)).toEqual(['loaded', 'idle']);
	});
});
