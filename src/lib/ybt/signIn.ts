import { invoke } from '@tauri-apps/api/core';
import { once } from '@tauri-apps/api/event';
import { fetch as desktopFetch } from '@tauri-apps/plugin-http';
import { openUrl } from '@tauri-apps/plugin-opener';
import { saveSession } from '$lib/desktopStore';
import { authorizeUrl, exchangeCode, registerClient } from './oauthClient';
import { redirectPath } from './oauthPaths';
import { createPkcePair, createState } from './pkce';
import { readRedirect } from './redirectResult';

const redirectEvent = 'sign-in-redirect';

export async function signInToYbt(ybtOrigin: string): Promise<void> {
	const port = await invoke<number>('start_sign_in_listener');
	const redirectUri = `http://127.0.0.1:${port}${redirectPath}`;
	const redirectArrival = nextRedirect();
	const clientId = await registerClient(desktopFetch, ybtOrigin, redirectUri);
	const pkce = await createPkcePair();
	const state = createState();
	await openUrl(authorizeUrl(ybtOrigin, { clientId, redirectUri, challenge: pkce.challenge, state }));
	const redirect = readRedirect(await redirectArrival, state);
	if ('problem' in redirect) throw new Error(redirect.problem);
	const exchange = { clientId, redirectUri, code: redirect.code, verifier: pkce.verifier };
	await saveSession(await exchangeCode(desktopFetch, ybtOrigin, exchange));
}

function nextRedirect(): Promise<string> {
	return new Promise((resolve) => {
		void once<string>(redirectEvent, (event) => resolve(event.payload));
	});
}

export async function signOutOfYbt(): Promise<void> {
	await saveSession(null);
}
