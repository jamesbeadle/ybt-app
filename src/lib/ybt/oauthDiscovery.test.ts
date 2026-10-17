import { describe, expect, it } from 'vitest';
import { discoverYbtOrigin } from './oauthDiscovery';

function answering(body: unknown, status = 200): typeof fetch {
	return async () => new Response(JSON.stringify(body), { status });
}

describe('discoverYbtOrigin', () => {
	it('uses the issuer YBT names, which is where it answers after any redirect', async () => {
		const origin = await discoverYbtOrigin(answering({ issuer: 'https://www.ybt.example' }), 'https://ybt.example');
		expect(origin).toBe('https://www.ybt.example');
	});

	it('keeps the configured address when YBT names no issuer', async () => {
		expect(await discoverYbtOrigin(answering({}), 'https://ybt.example')).toBe('https://ybt.example');
	});

	it('says so when YBT does not answer', async () => {
		await expect(discoverYbtOrigin(answering({}, 404), 'https://ybt.example')).rejects.toThrow('404');
	});
});
