<script lang="ts">
	import BoardTaskCard from './BoardTaskCard.svelte';
	import type { BuildQueueEntry } from '$lib/board/buildQueue';

	let { tasks }: { tasks: BuildQueueEntry[] } = $props();
</script>

{#if tasks.length > 0}
	<section class="grid gap-3">
		<h2 class="font-display font-medium text-caution">
			No model takes these
			<span class="block text-sm font-normal text-etch">Their points fall outside every model's range.</span>
		</h2>
		<div class="grid gap-3 md:grid-cols-3">
			{#each tasks as task (task.taskId)}
				<BoardTaskCard {task} />
			{/each}
		</div>
	</section>
{/if}
