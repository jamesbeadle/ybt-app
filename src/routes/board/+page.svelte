<script lang="ts">
	import ActionButton from '$lib/components/ActionButton.svelte';
	import BoardColumnList from '$lib/components/BoardColumnList.svelte';
	import BoardSkeleton from '$lib/components/BoardSkeleton.svelte';
	import { BuildBoard } from '$lib/board/buildBoard.svelte';

	const board = new BuildBoard();

	$effect(() => void board.load());
</script>

<div class="flex items-center justify-between gap-3">
	<h1 class="font-display text-xl font-bold">Buildable work</h1>
	<ActionButton isBusy={board.isLoading && board.hasLoaded} busyText="Refreshing…" onclick={() => board.load()}>
		Refresh
	</ActionButton>
</div>
{#if board.problem !== ''}
	<p class="text-signal">{board.problem}</p>
{:else if !board.hasLoaded}
	<BoardSkeleton />
{:else}
	<p class="text-etch">
		Open buildable tasks across your projects, under the model that takes each on this Mac. Change the ranges in
		Settings.
	</p>
	<BoardColumnList columns={board.columns} reviewModelId={board.reviewModelId} />
{/if}
