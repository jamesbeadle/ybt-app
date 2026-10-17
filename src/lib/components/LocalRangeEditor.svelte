<script lang="ts">
	import ActionButton from './ActionButton.svelte';
	import PointRangeFields from './PointRangeFields.svelte';
	import { isSameRange, rangePhrase, validateRange, type PointRange } from '$lib/board/modelRanges';

	let {
		ybtRange,
		current,
		onsave,
		onreset
	}: {
		ybtRange: PointRange;
		current: PointRange;
		onsave: (range: PointRange) => Promise<void>;
		onreset: () => Promise<void>;
	} = $props();

	let leastPoints = $derived(current.leastPoints);
	let mostPoints = $derived(current.mostPoints);
	let problem = $state('');
	let isSaving = $state(false);
	let isResetting = $state(false);

	const draft = $derived({ leastPoints, mostPoints });
	const isDirty = $derived(!isSameRange(draft, current));
	const isOverriding = $derived(!isSameRange(current, ybtRange));
	const standing = $derived(
		isOverriding ? `This Mac overrides YBT and takes ${rangePhrase(current)}.` : "Following YBT's range."
	);

	async function save() {
		problem = validateRange(draft) ?? '';
		if (problem !== '') return;
		isSaving = true;
		await onsave({ ...draft });
		isSaving = false;
	}

	async function reset() {
		problem = '';
		isResetting = true;
		await onreset();
		isResetting = false;
	}
</script>

<div class="grid gap-3">
	<PointRangeFields bind:leastPoints bind:mostPoints />
	<p class="text-sm {isOverriding ? 'text-caution' : 'text-mist'}">{standing}</p>
	{#if problem !== ''}<p class="text-sm text-signal">{problem}</p>{/if}
	<div class="flex gap-2">
		<ActionButton kind="primary" isBusy={isSaving} busyText="Saving…" disabled={!isDirty} onclick={save}>Save</ActionButton>
		{#if isOverriding || isDirty}
			<ActionButton isBusy={isResetting} busyText="Resetting…" onclick={reset}>Use YBT's</ActionButton>
		{/if}
	</div>
</div>
