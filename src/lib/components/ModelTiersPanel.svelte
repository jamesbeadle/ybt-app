<script lang="ts">
	import LoadingLine from './LoadingLine.svelte';
	import ModelTierCard from './ModelTierCard.svelte';
	import Panel from './Panel.svelte';
	import { BuildBoard } from '$lib/board/buildBoard.svelte';

	const board = new BuildBoard();

	$effect(() => void board.load());
</script>

<Panel title="Build models">
	<p class="mb-4 text-sm text-etch">
		YBT's tiers decide which model builds a task of each size. A range changed under On this Mac only affects this
		Mac: what the board shows and what the local builder takes.
	</p>
	{#if board.problem !== ''}
		<p class="text-signal">{board.problem}</p>
	{:else if !board.hasLoaded}
		<LoadingLine text="Reading the build models from YBT…" />
	{:else}
		<div class="grid gap-3">
			{#each board.ybtModels as ybtModel, index (ybtModel.modelId)}
				<ModelTierCard
					{ybtModel}
					current={board.models[index]}
					canEditModels={board.canEditModels}
					onsavelocal={(range) => board.setRange(ybtModel.modelId, range)}
					onresetlocal={() => board.useYbtRange(ybtModel.modelId)}
					onsavedybt={() => board.load()}
				/>
			{/each}
		</div>
	{/if}
</Panel>
