<script lang="ts">
	import SelectField from './SelectField.svelte';

	let { models, modelId = $bindable() }: { models: string[]; modelId: string } = $props();

	const noModelChoice = 'No model loaded';
	let hasModels = $derived(models.length > 0);
</script>

<label class="flex items-center gap-2 text-sm text-etch">
	<span>Local model</span>
	{#if hasModels}
		<SelectField choices={models} bind:value={modelId} label="Local model" class="min-w-56" />
	{:else}
		<SelectField choices={[noModelChoice]} value={noModelChoice} label="Local model" class="min-w-56" disabled />
	{/if}
</label>
