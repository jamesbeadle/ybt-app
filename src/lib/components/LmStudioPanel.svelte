<script lang="ts">
	import ActionButton from './ActionButton.svelte';
	import Panel from './Panel.svelte';
	import StatusLine from './StatusLine.svelte';
	import { hasAnsweredFor, rememberedConnections } from '$lib/connections/connectionMemory.svelte';
	import { checkLmStudio, modelCountPhrase } from '$lib/connections/lmStudioConnection';
	import { phaseOf } from '$lib/status/statusPhase';

	let { lmStudioOrigin }: { lmStudioOrigin: string } = $props();

	const memory = rememberedConnections.lmStudio;
	let isChecking = $state(false);

	const hasAnswered = $derived(hasAnsweredFor(memory, lmStudioOrigin));
	const servedModels = $derived(memory.models);
	const servedCount = $derived(servedModels.length);
	const hasProblem = $derived(memory.problem !== '');
	const isServing = $derived(!hasProblem && servedCount > 0);
	const phase = $derived(phaseOf(hasAnswered, isServing));
	const statusText = $derived.by(() => {
		if (hasProblem) return `LM Studio is not answering at ${lmStudioOrigin}.`;
		if (!isServing) return `LM Studio is running at ${lmStudioOrigin} but serving no models.`;
		return `Serving ${modelCountPhrase(servedCount)} at ${lmStudioOrigin}.`;
	});
	const hintText = $derived.by(() => {
		if (hasProblem) return `${memory.problem} Start its server in LM Studio's Developer tab.`;
		if (!isServing) return 'Load a model in LM Studio first.';
		return '';
	});

	async function checkAgain() {
		isChecking = true;
		await checkLmStudio(lmStudioOrigin);
		isChecking = false;
	}

	$effect(() => void checkLmStudio(lmStudioOrigin));
</script>

<Panel title="LM Studio">
	{#if hasAnswered}
		<StatusLine {phase} text={statusText} />
		{#if hintText !== ''}<p class="mt-1 pl-5 text-sm text-mist">{hintText}</p>{/if}
		{#if isServing}
			<ul class="mt-3 flex flex-wrap gap-2">
				{#each servedModels as model (model)}
					<li class="rounded-md border border-hairline bg-night px-2 py-1 font-mono text-xs text-etch">{model}</li>
				{/each}
			</ul>
		{/if}
	{:else}
		<StatusLine {phase} text="Looking for LM Studio at {lmStudioOrigin}…" />
	{/if}
	<div class="mt-4">
		<ActionButton isBusy={isChecking} busyText="Checking…" onclick={checkAgain}>Check again</ActionButton>
	</div>
</Panel>
