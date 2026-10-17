import { load, type Store } from '@tauri-apps/plugin-store';
import { defaultSettings, type DesktopSettings } from './settings/desktopSettings';
import type { RangeOverrides } from './board/modelRanges';
import type { YbtSession } from './ybt/ybtSession';

const storeFile = 'ybt-desktop.json';
const storeKeys = { settings: 'settings', session: 'session', rangeOverrides: 'rangeOverrides', harnessCheckout: 'harnessCheckout' } as const;

function openStore(): Promise<Store> {
	return load(storeFile, { autoSave: true, defaults: {} });
}

export async function readSettings(): Promise<DesktopSettings> {
	const store = await openStore();
	const saved = await store.get<DesktopSettings>(storeKeys.settings);
	return { ...defaultSettings, ...saved };
}

export async function saveSettings(settings: DesktopSettings): Promise<void> {
	const store = await openStore();
	await store.set(storeKeys.settings, settings);
}

export async function readSession(): Promise<YbtSession | null> {
	const store = await openStore();
	return (await store.get<YbtSession>(storeKeys.session)) ?? null;
}

export async function saveSession(session: YbtSession | null): Promise<void> {
	const store = await openStore();
	await store.set(storeKeys.session, session);
}

export async function readRangeOverrides(): Promise<RangeOverrides> {
	const store = await openStore();
	return (await store.get<RangeOverrides>(storeKeys.rangeOverrides)) ?? {};
}

export async function saveRangeOverrides(overrides: RangeOverrides): Promise<void> {
	const store = await openStore();
	await store.set(storeKeys.rangeOverrides, overrides);
}

export async function readHarnessCheckout(): Promise<string> {
	const store = await openStore();
	return (await store.get<string>(storeKeys.harnessCheckout)) ?? '';
}

export async function saveHarnessCheckout(checkout: string): Promise<void> {
	const store = await openStore();
	await store.set(storeKeys.harnessCheckout, checkout);
}
