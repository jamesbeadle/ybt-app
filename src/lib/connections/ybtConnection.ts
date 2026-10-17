import { readSession } from '$lib/desktopStore';
import { failureText } from '$lib/failures/failureText';
import { parseAccount, type YbtAccount } from '$lib/ybt/account';
import { performAction } from '$lib/ybt/ybtConnector';
import { forgetAnswer, rememberedConnections } from './connectionMemory.svelte';

export async function checkYbtAccount(ybtOrigin: string): Promise<void> {
	const session = await readSession();
	if (session === null) return remember(ybtOrigin, null, '');
	const answer = await performAction('who_am_i').catch((failure: unknown) => new Error(failureText(failure)));
	if (answer instanceof Error) return remember(ybtOrigin, null, answer.message);
	remember(ybtOrigin, parseAccount(answer), '');
}

/** Signing in or out changes the answer, so the status shows checking until YBT answers again. */
export async function confirmYbtAccount(ybtOrigin: string): Promise<void> {
	forgetAnswer(rememberedConnections.ybt);
	await checkYbtAccount(ybtOrigin);
}

function remember(origin: string, account: YbtAccount | null, problem: string): void {
	const memory = rememberedConnections.ybt;
	memory.origin = origin;
	memory.account = account;
	memory.problem = problem;
	memory.hasAnswered = true;
}
