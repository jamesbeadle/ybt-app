<script lang="ts">
	import BoardTaskCard from './BoardTaskCard.svelte';
	import type { BuildModel, BuildQueueEntry } from '$lib/board/buildQueue';

	let {
		model,
		tasks,
		reviewModelId
	}: { model: BuildModel | null; tasks: BuildQueueEntry[]; reviewModelId: string } = $props();
</script>

<section class="grid content-start gap-3">
	{#if model}
		<h2 class="font-display font-medium">
			{model.label}
			<span class="text-sm text-etch">
				{model.leastPoints}–{model.mostPoints} points{model.modelId === reviewModelId ? ' · reviews' : ''}
			</span>
		</h2>
	{:else}
		<h2 class="font-display font-medium text-caution">No model takes these</h2>
	{/if}
	{#each tasks as task (task.taskId)}<BoardTaskCard {task} />{:else}<p class="text-sm text-etch">Nothing waiting.</p>{/each}
</section>
