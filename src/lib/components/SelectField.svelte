<script lang="ts" generics="Choice extends string | number">
	let {
		choices,
		value = $bindable(),
		label,
		labelOf = String,
		class: className = ''
	}: {
		choices: readonly Choice[];
		value: Choice;
		label: string;
		labelOf?: (choice: Choice) => string;
		class?: string;
	} = $props();
</script>

<span class="relative inline-block {className}">
	<select class="field appearance-none pr-9" aria-label={label} bind:value>
		{#each choices as choice (choice)}
			<option value={choice}>{labelOf(choice)}</option>
		{/each}
	</select>
	<svg
		class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-mist"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-width="1.75"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M4 6l4 4 4-4" />
	</svg>
</span>
