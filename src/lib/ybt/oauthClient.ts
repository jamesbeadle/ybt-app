import { clientName, oauthPaths, oauthScope } from './oauthPaths';
import type { YbtSession } from './ybtSession';

export type Fetcher = typeof fetch;

type TokenAnswer = { access_token: string; refresh_token: string; expires_in: number };

const millisecondsPerSecond = 1000;
const formHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

export async function registerClient(fetcher: Fetcher, ybtOrigin: string, redirectUri: string): Promise<string> {
	const response = await fetcher(`${ybtOrigin}${oauthPaths.register}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ client_name: clientName, redirect_uris: [redirectUri], token_endpoint_auth_method: 'none' })
	});
	if (!response.ok) throw new Error(`YBT would not register the app (${response.status}).`);
	const registration: { client_id: string } = await response.json();
	return registration.client_id;
}

export type AuthorizeRequest = { clientId: string; redirectUri: string; challenge: string; state: string };

export function authorizeUrl(ybtOrigin: string, request: AuthorizeRequest): string {
	const parameters = new URLSearchParams({
		response_type: 'code',
		client_id: request.clientId,
		redirect_uri: request.redirectUri,
		code_challenge: request.challenge,
		code_challenge_method: 'S256',
		scope: oauthScope,
		state: request.state
	});
	return `${ybtOrigin}${oauthPaths.authorize}?${parameters}`;
}

export type CodeExchange = { clientId: string; redirectUri: string; code: string; verifier: string };

export function exchangeCode(fetcher: Fetcher, ybtOrigin: string, exchange: CodeExchange): Promise<YbtSession> {
	const fields = {
		grant_type: 'authorization_code',
		client_id: exchange.clientId,
		redirect_uri: exchange.redirectUri,
		code: exchange.code,
		code_verifier: exchange.verifier
	};
	return requestTokens(fetcher, ybtOrigin, exchange.clientId, fields);
}

export function refreshSession(fetcher: Fetcher, session: YbtSession): Promise<YbtSession> {
	const fields = { grant_type: 'refresh_token', client_id: session.clientId, refresh_token: session.refreshToken };
	return requestTokens(fetcher, session.ybtOrigin, session.clientId, fields);
}

async function requestTokens(
	fetcher: Fetcher,
	ybtOrigin: string,
	clientId: string,
	fields: Record<string, string>
): Promise<YbtSession> {
	const response = await fetcher(`${ybtOrigin}${oauthPaths.token}`, {
		method: 'POST',
		headers: formHeaders,
		body: new URLSearchParams(fields).toString()
	});
	if (!response.ok) throw new Error(`YBT refused the sign-in (${response.status}). Sign in again.`);
	const answer: TokenAnswer = await response.json();
	const expiresAt = Date.now() + answer.expires_in * millisecondsPerSecond;
	return { ybtOrigin, clientId, accessToken: answer.access_token, refreshToken: answer.refresh_token, expiresAt };
}
