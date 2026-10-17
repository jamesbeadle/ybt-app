import { fetch as desktopFetch } from '@tauri-apps/plugin-http';
import { readSession, saveSession } from '$lib/desktopStore';
import { oauthPaths } from './oauthPaths';
import { refreshSession } from './oauthClient';
import { readToolText, type ConnectorAnswer } from './toolAnswer';
import { needsRefresh, type YbtSession } from './ybtSession';

export type ConnectorTool = { name: string; description: string; inputSchema: Record<string, unknown> };

let nextRequestId = 1;

export async function performAction(name: string, input: Record<string, unknown> = {}): Promise<string> {
	return callTool('perform_action', { name, input });
}

export async function callTool(toolName: string, toolArguments: Record<string, unknown>): Promise<string> {
	return readToolText(await sendRequest('tools/call', { name: toolName, arguments: toolArguments }));
}

export async function listTools(): Promise<ConnectorTool[]> {
	const { result, error } = await sendRequest('tools/list', {});
	if (error !== undefined) throw new Error(error.message);
	const { tools } = result as { tools: ConnectorTool[] };
	return tools;
}

async function sendRequest(method: string, params: Record<string, unknown>): Promise<ConnectorAnswer> {
	const session = await currentSession();
	const request = { jsonrpc: '2.0', id: nextRequestId++, method, params };
	const response = await desktopFetch(`${session.ybtOrigin}${oauthPaths.connector}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', authorization: `Bearer ${session.accessToken}` },
		body: JSON.stringify(request)
	});
	if (!response.ok) throw new Error(`YBT answered ${response.status} at ${response.url}. Sign in again if it persists.`);
	return response.json();
}

async function currentSession(): Promise<YbtSession> {
	const session = await readSession();
	if (session === null) throw new Error('Sign in to YBT first.');
	const now = Date.now();
	if (!needsRefresh(session, now)) return session;
	const refreshed = await refreshSession(desktopFetch, session);
	await saveSession(refreshed);
	return refreshed;
}
