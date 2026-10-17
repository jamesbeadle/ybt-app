<script lang="ts">
	import { untrack } from 'svelte';
	import HarnessStepCard from '$lib/components/HarnessStepCard.svelte';
	import HarnessTestForm from '$lib/components/HarnessTestForm.svelte';
	import ModelChoiceRow from '$lib/components/ModelChoiceRow.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import { saveHarnessCheckout } from '$lib/desktopStore';
	import { HarnessTest } from '$lib/harness/harnessTest.svelte';
	import { ChatModelChoice } from '$lib/lmStudio/chatModelChoice.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { settings, checkout: savedCheckout } = untrack(() => data);
	const { lmStudioOrigin } = settings;
	const test = new HarnessTest();
	const choice = new ChatModelChoice(lmStudioOrigin);
	let checkout = $state(savedCheckout);

	async function run(request: { checkout: string; taskText: string; model: string }) {
		await saveHarnessCheckout(request.checkout);
		await test.run({ ...request, lmStudioOrigin });
	}

	$effect(() => void choice.read());
</script>

<Panel title="Test the local builder">
	<p class="mb-4 text-etch">
		Claude Code builds one easy task on the local model in a fresh branch, then the repository's checks and the audit
		gate run. Every step shows here as it happens. Nothing is pushed.
	</p>
	<ModelChoiceRow {choice} />
	<HarnessTestForm modelId={choice.modelId} bind:checkout isRunning={test.isRunning} onrun={run} />
</Panel>
{#if test.problem !== ''}<p class="text-signal">{test.problem}</p>{/if}
<ol class="grid gap-3">
	{#each test.steps as step, index (index)}<HarnessStepCard {step} />{/each}
</ol>
