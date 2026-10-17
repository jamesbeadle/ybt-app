import { readSession } from '$lib/desktopStore';
import { failureText } from '$lib/failures/failureText';
import { parseAccount, type YbtAccount } from '$lib/ybt/account';
import { performAction } from '$lib/ybt/ybtConnector';
import { rememberedConnections } from './connectionMemory.svelte';

export async function checkYbtAccount(): Promise<void> {
	const session = await readSession();
	if (session === null) return remember(null, '');
	const answer = await performAction('who_am_i').catch((failure: unknown) => new Error(failureText(failure)));
	if (answer instanceof Error) return remember(null, answer.message);
	remember(parseAccount(answer), '');
}

function remember(account: YbtAccount | null, problem: string): void {
	const memory = rememberedConnections.ybt;
	memory.account = account;
	memory.problem = problem;
	memory.hasAnswered = true;
}
