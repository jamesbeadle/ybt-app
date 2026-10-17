<script lang="ts">
	import { fetch as desktopFetch } from '@tauri-apps/plugin-http';
	import Panel from './Panel.svelte';
	import StatusLine from './StatusLine.svelte';
	import { listLocalModels } from '$lib/lmStudio/lmStudio';

	let { lmStudioOrigin }: { lmStudioOrigin: string } = $props();

	let models = $state<string[]>([]);
	let problem = $state('');

	async function readModels() {
		problem = '';
		models = await listLocalModels(desktopFetch, lmStudioOrigin).catch((failure: Error) => {
			problem = `LM Studio is not answering at ${lmStudioOrigin}: ${failure.message}`;
			return [];
		});
	}

	$effect(() => void readModels());
</script>

<Panel title="LM Studio">
	{#if problem !== ''}
		<StatusLine isGood={false} text={problem} />
	{:else}
		<StatusLine isGood={true} text="Serving {models.length} model(s) at {lmStudioOrigin}." />
		<ul class="mt-2 list-disc pl-5 text-etch">
			{#each models as model (model)}<li>{model}</li>{/each}
		</ul>
	{/if}
	<button class="mt-3 rounded-lg border border-hairline px-3 py-1.5" onclick={readModels}>Check again</button>
</Panel>
