<script lang="ts">
	import SelectField from './SelectField.svelte';

	let { models, modelId = $bindable() }: { models: string[]; modelId: string } = $props();
</script>

<label class="flex items-center gap-2 text-sm text-etch">
	<span>Local model</span>
	<SelectField choices={models} bind:value={modelId} label="Local model" class="min-w-56" />
</label>
