<script lang="ts">
	import ModelRangeRow from './ModelRangeRow.svelte';
	import type { BuildModel } from '$lib/board/buildQueue';
	import type { PointRange } from '$lib/board/modelRanges';

	let {
		ybtModels,
		models,
		onsave,
		onreset
	}: {
		ybtModels: BuildModel[];
		models: BuildModel[];
		onsave: (modelId: string, range: PointRange) => void;
		onreset: (modelId: string) => void;
	} = $props();
</script>

<table class="w-full text-left">
	<thead class="text-sm text-etch"><tr><th>Model</th><th>YBT's range</th><th>On this machine</th><th></th></tr></thead>
	<tbody>
		{#each ybtModels as ybtModel, index (ybtModel.modelId)}
			<ModelRangeRow
				{ybtModel}
				current={models[index]}
				onsave={(range) => onsave(ybtModel.modelId, range)}
				onreset={() => onreset(ybtModel.modelId)}
			/>
		{/each}
	</tbody>
</table>
