<script lang="ts">
	import type { BuildModel } from '$lib/board/buildQueue';
	import { rangePhrase } from '$lib/board/modelRanges';
	import { harnessLimits } from '$lib/harness/harnessRequest';
	import SelectField from './SelectField.svelte';

	let {
		models,
		buildsFolder = $bindable(),
		tierModelId = $bindable(),
		nextTierLabel,
		disabled,
		onchange
	}: {
		models: BuildModel[];
		buildsFolder: string;
		tierModelId: string;
		nextTierLabel: string;
		disabled: boolean;
		onchange: () => void;
	} = $props();

	const loadingChoice = 'Reading the tiers from YBT…';

	let modelIds = $derived(models.map((model) => model.modelId));
	let hasTiers = $derived(models.length > 0);
	let failureSentence = $derived(
		nextTierLabel === ''
			? 'A build that fails is given back to YBT with a note.'
			: `A build that fails is given back with a note and handed up to the ${nextTierLabel}.`
	);

	function labelOf(modelId: string): string {
		const model = models.find((candidate) => candidate.modelId === modelId);
		if (model === undefined) return modelId;
		return `${model.label} (${rangePhrase(model)})`;
	}
</script>

<div class="grid gap-3 md:grid-cols-2" {onchange}>
	<label class="grid gap-1 text-sm text-etch">
		<span>Where this machine keeps the repositories it builds</span>
		<input
			class="field"
			placeholder="/Users/you/ybt-builds"
			required
			maxlength={harnessLimits.longestCheckoutPath}
			{disabled}
			bind:value={buildsFolder}
		/>
	</label>
	<label class="grid gap-1 text-sm text-etch">
		<span>The tier this machine builds for</span>
		{#if hasTiers}
			<SelectField choices={modelIds} bind:value={tierModelId} label="Tier" {labelOf} {disabled} />
		{:else}
			<SelectField choices={[loadingChoice]} value={loadingChoice} label="Tier" disabled />
		{/if}
	</label>
</div>
<p class="mt-3 text-sm text-mist">{failureSentence}</p>
