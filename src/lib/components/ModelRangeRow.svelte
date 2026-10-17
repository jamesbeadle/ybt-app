<script lang="ts">
	import { untrack } from 'svelte';
	import { storyPointScale, validateRange, type PointRange } from '$lib/board/modelRanges';
	import type { BuildModel } from '$lib/board/buildQueue';

	let {
		ybtModel,
		current,
		onsave,
		onreset
	}: { ybtModel: BuildModel; current: BuildModel; onsave: (range: PointRange) => void; onreset: () => void } = $props();

	let draft = $state(untrack(() => ({ leastPoints: current.leastPoints, mostPoints: current.mostPoints })));
	let problem = $state('');

	function save() {
		problem = validateRange(draft) ?? '';
		if (problem === '') onsave({ ...draft });
	}
</script>

<tr class="border-t border-hairline">
	<td class="py-2">{ybtModel.label}</td>
	<td class="text-etch">{ybtModel.leastPoints}–{ybtModel.mostPoints}</td>
	<td>
		<select class="rounded border border-hairline bg-night px-1" bind:value={draft.leastPoints}>
			{#each storyPointScale as points (points)}<option value={points}>{points}</option>{/each}
		</select>
		to
		<select class="rounded border border-hairline bg-night px-1" bind:value={draft.mostPoints}>
			{#each storyPointScale as points (points)}<option value={points}>{points}</option>{/each}
		</select>
	</td>
	<td class="flex gap-2 py-2">
		<button class="rounded-lg bg-signal px-2 py-1 text-sm" onclick={save}>Save</button>
		<button class="rounded-lg border border-hairline px-2 py-1 text-sm" onclick={onreset}>Use YBT's</button>
	</td>
</tr>
{#if problem !== ''}<tr><td colspan="4" class="text-signal">{problem}</td></tr>{/if}
