<script lang="ts">
	import LocalRangeEditor from './LocalRangeEditor.svelte';
	import YbtTierEditor from './YbtTierEditor.svelte';
	import type { BuildModel } from '$lib/board/buildQueue';
	import { rangePhrase, type PointRange } from '$lib/board/modelRanges';

	let {
		ybtModel,
		current,
		canEditModels,
		onsavelocal,
		onresetlocal,
		onsavedybt
	}: {
		ybtModel: BuildModel;
		current: BuildModel;
		canEditModels: boolean;
		onsavelocal: (range: PointRange) => Promise<void>;
		onresetlocal: () => Promise<void>;
		onsavedybt: () => Promise<void>;
	} = $props();
</script>

<article class="rounded-lg border border-hairline bg-night p-4">
	<header class="mb-4 flex items-baseline justify-between gap-3">
		<div>
			<h3 class="font-display font-medium">{ybtModel.label}</h3>
			{#if ybtModel.runsOn}<p class="text-sm text-etch">Runs on {ybtModel.runsOn}</p>{/if}
		</div>
		<p class="text-sm text-etch">YBT takes {rangePhrase(ybtModel)}</p>
	</header>
	<div class="grid gap-5 md:grid-cols-2">
		<section>
			<h4 class="mb-2 text-xs font-medium tracking-wide text-mist uppercase">In YBT</h4>
			{#if canEditModels}
				<YbtTierEditor model={ybtModel} onsaved={onsavedybt} />
			{:else}
				<p class="text-sm text-etch">Only a YBT administrator can change the tier itself.</p>
			{/if}
		</section>
		<section>
			<h4 class="mb-2 text-xs font-medium tracking-wide text-mist uppercase">On this Mac</h4>
			<LocalRangeEditor ybtRange={ybtModel} {current} onsave={onsavelocal} onreset={onresetlocal} />
		</section>
	</div>
</article>
