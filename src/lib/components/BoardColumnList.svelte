<script lang="ts">
	import BoardColumnSection from './BoardColumnSection.svelte';
	import type { BoardColumn } from '$lib/board/boardLayout';

	let { columns, reviewModelId }: { columns: BoardColumn[]; reviewModelId: string } = $props();
</script>

<div class="grid gap-4 md:grid-cols-3">
	{#each columns as column, index (index)}
		<BoardColumnSection model={column.model} tasks={column.tasks} {reviewModelId} />
	{/each}
</div>
