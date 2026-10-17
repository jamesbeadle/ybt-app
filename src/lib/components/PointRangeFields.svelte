<script lang="ts">
	import SelectField from './SelectField.svelte';
	import { storyPointScale } from '$lib/board/modelRanges';

	let { leastPoints = $bindable(), mostPoints = $bindable() }: { leastPoints: number; mostPoints: number } = $props();
</script>

<div class="flex items-center gap-2 text-sm text-etch">
	<SelectField choices={storyPointScale} bind:value={leastPoints} label="Least points" class="w-20" />
	<span>to</span>
	<SelectField choices={storyPointScale} bind:value={mostPoints} label="Most points" class="w-20" />
	<span>points</span>
</div>
