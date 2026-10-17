<script lang="ts">
	import BoardTaskCard from './BoardTaskCard.svelte';
	import type { BuildModel, BuildQueueEntry } from '$lib/board/buildQueue';
	import { rangePhrase } from '$lib/board/modelRanges';

	let { model, tasks, reviewModelId }: { model: BuildModel; tasks: BuildQueueEntry[]; reviewModelId: string } = $props();

	let isReviewer = $derived(model.modelId === reviewModelId);
	let roleText = $derived(isReviewer ? ' · reviews' : '');
</script>

<section class="grid content-start gap-3">
	<h2 class="font-display font-medium">
		{model.label}
		<span class="block text-sm font-normal text-etch">{rangePhrase(model)}{roleText}</span>
	</h2>
	{#each tasks as task (task.taskId)}
		<BoardTaskCard {task} />
	{:else}
		<p class="rounded-lg border border-dashed border-hairline px-3 py-4 text-center text-sm text-mist">Nothing waiting.</p>
	{/each}
</section>
