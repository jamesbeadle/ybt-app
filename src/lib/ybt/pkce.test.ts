import { describe, expect, it } from 'vitest';
import { base64Url, createPkcePair } from './pkce';

describe('pkce', () => {
	it('writes bytes as unpadded base64url', () => {
		expect(base64Url(new Uint8Array([251, 255, 191]))).toBe('-_-_');
	});

	it('makes the challenge the SHA-256 of the verifier', async () => {
		const pair = await createPkcePair();
		const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pair.verifier));
		expect(pair.challenge).toBe(base64Url(new Uint8Array(digest)));
		expect(pair.verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
	});
});
