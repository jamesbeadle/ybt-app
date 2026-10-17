import { describe, expect, it } from 'vitest';
import { preferredModel } from './preferredModel';

describe('preferredModel', () => {
	it('prefers the office Qwen model and never an embedding model', () => {
		expect(preferredModel(['text-embedding-nomic', 'gemma-3', 'qwen3.6-35b-a3b'])).toBe('qwen3.6-35b-a3b');
		expect(preferredModel(['text-embedding-nomic', 'gemma-3'])).toBe('gemma-3');
	});

	it('has nothing to offer when nothing chats', () => {
		expect(preferredModel(['text-embedding-nomic'])).toBe('');
	});
});
