import type { YbtAccount } from '$lib/ybt/account';

export type YbtMemory = { hasAnswered: boolean; account: YbtAccount | null; problem: string };
export type LmStudioMemory = { hasAnswered: boolean; models: string[]; problem: string };

type RememberedConnections = { ybt: YbtMemory; lmStudio: LmStudioMemory };

/** What each connection last answered, kept while the app runs so a screen never starts from blank. */
export const rememberedConnections: RememberedConnections = $state({
	ybt: { hasAnswered: false, account: null, problem: '' },
	lmStudio: { hasAnswered: false, models: [], problem: '' }
});
