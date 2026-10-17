<script lang="ts">
	import { fetch as desktopFetch } from '@tauri-apps/plugin-http';
	import { untrack } from 'svelte';
	import HarnessStepCard from '$lib/components/HarnessStepCard.svelte';
	import HarnessTestForm from '$lib/components/HarnessTestForm.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import { readHarnessCheckout, saveHarnessCheckout } from '$lib/desktopStore';
	import { HarnessTest } from '$lib/harness/harnessTest.svelte';
	import { listLocalModels } from '$lib/lmStudio/lmStudio';
	import { chatModels, preferredModel } from '$lib/lmStudio/preferredModel';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { settings } = untrack(() => data);
	const { lmStudioOrigin } = settings;
	const test = new HarnessTest();
	let models = $state<string[]>([]);
	let modelId = $state('');
	let checkout = $state('');

	async function prepare() {
		const served = await listLocalModels(desktopFetch, lmStudioOrigin).catch(() => []);
		models = chatModels(served);
		modelId = preferredModel(served);
		checkout = await readHarnessCheckout();
	}

	async function run(choice: { checkout: string; taskText: string; model: string }) {
		await saveHarnessCheckout(choice.checkout);
		await test.run({ ...choice, lmStudioOrigin });
	}

	$effect(() => void prepare());
</script>

<Panel title="Test the local builder">
	<p class="mb-4 text-etch">
		Claude Code builds one easy task on the local model in a fresh branch, then the repository's checks and the audit
		gate run. Every step shows here as it happens. Nothing is pushed.
	</p>
	<HarnessTestForm {models} bind:modelId bind:checkout isRunning={test.isRunning} onrun={run} />
</Panel>
{#if test.problem !== ''}<p class="text-signal">{test.problem}</p>{/if}
<ol class="grid gap-3">
	{#each test.steps as step, index (index)}<HarnessStepCard {step} />{/each}
</ol>
