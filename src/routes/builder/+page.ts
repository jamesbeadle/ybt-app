import { readBuilderSettings } from '$lib/builder/builderStore';
import { localBuilder } from '$lib/builder/localBuilder.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	await localBuilder.load();
	return { builderSettings: await readBuilderSettings() };
};
