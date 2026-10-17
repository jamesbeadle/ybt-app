import { describe, expect, it } from 'vitest';
import { authorizeUrl, exchangeCode, registerClient } from './oauthClient';

const origin = 'https://ybt.example';

function answering(body: unknown, seen: Request[] = []): typeof fetch {
	return async (input, init) => {
		seen.push(new Request(input, init));
		return new Response(JSON.stringify(body), { status: 200 });
	};
}

describe('oauthClient', () => {
	it('registers as a public client with the loopback redirect', async () => {
		const seen: Request[] = [];
		const clientId = await registerClient(answering({ client_id: 'c1' }, seen), origin, 'http://127.0.0.1:5000/callback');
		const sent = await seen[0].json();
		expect(clientId).toBe('c1');
		expect(sent.redirect_uris).toEqual(['http://127.0.0.1:5000/callback']);
		expect(sent.token_endpoint_auth_method).toBe('none');
	});

	it('asks for a code with an S256 challenge', () => {
		const address = new URL(authorizeUrl(origin, { clientId: 'c1', redirectUri: 'r', challenge: 'ch', state: 's' }));
		expect(address.pathname).toBe('/oauth/authorize');
		expect(address.searchParams.get('code_challenge_method')).toBe('S256');
	});

	it('turns the token answer into a session that expires on time', async () => {
		const tokens = { access_token: 'ybt_at_1', refresh_token: 'ybt_rt_1', expires_in: 3600 };
		const before = Date.now();
		const session = await exchangeCode(answering(tokens), origin, { clientId: 'c1', redirectUri: 'r', code: 'k', verifier: 'v' });
		expect(session.accessToken).toBe('ybt_at_1');
		expect(session.expiresAt).toBeGreaterThanOrEqual(before + 3_600_000);
	});
});
