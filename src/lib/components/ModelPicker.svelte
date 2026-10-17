<script lang="ts">
	let { models, modelId = $bindable() }: { models: string[]; modelId: string } = $props();
</script>

<label class="flex items-center gap-2 text-etch">
	<span>Local model</span>
	<select class="rounded-lg border border-hairline bg-night px-2 py-1 text-chalk" bind:value={modelId}>
		{#each models as model (model)}<option value={model}>{model}</option>{/each}
	</select>
</label>
