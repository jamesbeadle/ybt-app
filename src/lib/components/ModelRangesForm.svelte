<script lang="ts">
	import ModelRangesTable from './ModelRangesTable.svelte';
	import Panel from './Panel.svelte';
	import { BuildBoard } from '$lib/board/buildBoard.svelte';

	const board = new BuildBoard();

	$effect(() => void board.load());
</script>

<Panel title="Story points each model takes on this machine">
	<p class="mb-3 text-etch">
		These start from YBT admin's ranges. A change here only affects this Mac: what the board shows and what the
		local builder takes.
	</p>
	{#if board.problem !== ''}
		<p class="text-signal">{board.problem}</p>
	{:else}
		<ModelRangesTable
			ybtModels={board.ybtModels}
			models={board.models}
			onsave={(modelId, range) => board.setRange(modelId, range)}
			onreset={(modelId) => board.useYbtRange(modelId)}
		/>
	{/if}
</Panel>
