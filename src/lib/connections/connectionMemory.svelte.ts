import type { YbtAccount } from '$lib/ybt/account';

type Answered = { hasAnswered: boolean; origin: string };
export type YbtMemory = Answered & { account: YbtAccount | null; problem: string };
export type LmStudioMemory = Answered & { models: string[]; problem: string };

type RememberedConnections = { ybt: YbtMemory; lmStudio: LmStudioMemory };

/** What each connection last answered, kept while the app runs so a screen never starts from blank. */
export const rememberedConnections: RememberedConnections = $state({
	ybt: { hasAnswered: false, origin: '', account: null, problem: '' },
	lmStudio: { hasAnswered: false, origin: '', models: [], problem: '' }
});

/** An answer belongs to the address it was asked of; a changed address starts from checking again. */
export function hasAnsweredFor(memory: Answered, origin: string): boolean {
	return memory.hasAnswered && memory.origin === origin;
}

/** Signing in or out makes the last answer stale, so the status shows checking until the next one. */
export function forgetAnswer(memory: Answered): void {
	memory.hasAnswered = false;
}
