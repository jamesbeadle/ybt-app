<script lang="ts">
	import BoardTaskCard from './BoardTaskCard.svelte';
	import type { BuildModel, BuildQueueEntry } from '$lib/board/buildQueue';
	import { rangePhrase } from '$lib/board/modelRanges';

	let {
		model,
		tasks,
		reviewModelId
	}: { model: BuildModel | null; tasks: BuildQueueEntry[]; reviewModelId: string } = $props();

	let isReviewer = $derived(model !== null && model.modelId === reviewModelId);
</script>

<section class="grid content-start gap-3">
	{#if model}
		<h2 class="font-display font-medium">
			{model.label}
			<span class="text-sm font-normal text-etch">{rangePhrase(model)}{isReviewer ? ' · reviews' : ''}</span>
		</h2>
	{:else}
		<h2 class="font-display font-medium text-caution">No model takes these</h2>
	{/if}
	{#each tasks as task (task.taskId)}
		<BoardTaskCard {task} />
	{:else}
		<p class="rounded-lg border border-dashed border-hairline px-3 py-4 text-center text-sm text-mist">Nothing waiting.</p>
	{/each}
</section>
