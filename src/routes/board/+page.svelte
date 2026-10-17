<script lang="ts">
	import BoardColumnList from '$lib/components/BoardColumnList.svelte';
	import { BuildBoard } from '$lib/board/buildBoard.svelte';

	const board = new BuildBoard();

	$effect(() => void board.load());
</script>

<div class="flex items-center justify-between">
	<h1 class="font-display text-xl font-bold">Buildable work</h1>
	<button class="rounded-lg border border-hairline px-3 py-1.5" onclick={() => board.load()}>Refresh</button>
</div>
{#if board.problem !== ''}
	<p class="text-signal">{board.problem}</p>
{:else if board.isLoading}
	<p class="text-etch">Reading the build queue from YBT…</p>
{:else}
	<p class="text-etch">Open buildable tasks across your projects, under the model that takes each on this machine. Change the ranges in Settings.</p>
	<BoardColumnList columns={board.columns} reviewModelId={board.reviewModelId} />
{/if}
