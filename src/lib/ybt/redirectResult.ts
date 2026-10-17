export type RedirectResult = { code: string } | { problem: string };

const placeholderOrigin = 'http://127.0.0.1';

export function readRedirect(requestPath: string, expectedState: string): RedirectResult {
	const parameters = new URL(requestPath, placeholderOrigin).searchParams;
	const refusal = parameters.get('error');
	if (refusal !== null) return { problem: `YBT did not sign you in (${refusal}).` };
	if (parameters.get('state') !== expectedState) {
		return { problem: 'The sign-in answer did not match the request. Try again.' };
	}
	const code = parameters.get('code') ?? '';
	if (code === '') return { problem: 'YBT sent no sign-in code. Try again.' };
	return { code };
}
