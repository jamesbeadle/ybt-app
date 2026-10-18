import { openStore } from '$lib/desktopStore';
import type { BuildRecord } from './buildOutcome';

/** What the Builder screen remembers between runs: where the repositories live and which tier this machine builds for. */
type BuilderSettings = { buildsFolder: string; tierModelId: string };

const defaultBuilderSettings: BuilderSettings = { buildsFolder: '', tierModelId: '' };
export const longestHistory = 50;

const storeKeys = { builderSettings: 'builderSettings', buildHistory: 'buildHistory' } as const;

export async function readBuilderSettings(): Promise<BuilderSettings> {
	const store = await openStore();
	const saved = await store.get<BuilderSettings>(storeKeys.builderSettings);
	return { ...defaultBuilderSettings, ...saved };
}

export async function saveBuilderSettings(settings: BuilderSettings): Promise<void> {
	const store = await openStore();
	await store.set(storeKeys.builderSettings, settings);
}

export async function readBuildHistory(): Promise<BuildRecord[]> {
	const store = await openStore();
	return (await store.get<BuildRecord[]>(storeKeys.buildHistory)) ?? [];
}

export async function saveBuildHistory(history: BuildRecord[]): Promise<void> {
	const store = await openStore();
	await store.set(storeKeys.buildHistory, history.slice(0, longestHistory));
}
