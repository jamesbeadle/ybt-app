import { fetch as desktopFetch } from '@tauri-apps/plugin-http';
import { failureText } from '$lib/failures/failureText';
import { listLocalModels } from '$lib/lmStudio/lmStudio';
import { rememberedConnections } from './connectionMemory.svelte';

const oneModel = 1;

export async function checkLmStudio(lmStudioOrigin: string): Promise<void> {
	const models = await listLocalModels(desktopFetch, lmStudioOrigin).catch(
		(failure: unknown) => new Error(failureText(failure))
	);
	if (models instanceof Error) return remember(lmStudioOrigin, [], models.message);
	remember(lmStudioOrigin, models, '');
}

export function modelCountPhrase(count: number): string {
	if (count === oneModel) return 'one model';
	return `${count} models`;
}

function remember(origin: string, models: string[], problem: string): void {
	const memory = rememberedConnections.lmStudio;
	memory.origin = origin;
	memory.models = models;
	memory.problem = problem;
	memory.hasAnswered = true;
}
