import { readBuildHistory, readBuilderSettings } from '$lib/builder/builderStore';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => ({
	builderSettings: await readBuilderSettings(),
	buildHistory: await readBuildHistory()
});
