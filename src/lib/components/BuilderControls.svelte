<script lang="ts">
	import ActionButton from './ActionButton.svelte';

	let {
		canBuild,
		isBuilding,
		isKeepingGoing,
		onbuild,
		onkeepgoing,
		onstop
	}: {
		canBuild: boolean;
		isBuilding: boolean;
		isKeepingGoing: boolean;
		onbuild: () => void;
		onkeepgoing: () => void;
		onstop: () => void;
	} = $props();
</script>

<div class="flex items-center gap-2">
	{#if isKeepingGoing}
		<ActionButton onclick={onstop}>Stop after this task</ActionButton>
	{:else}
		<ActionButton disabled={!canBuild} onclick={onkeepgoing}>Keep going</ActionButton>
	{/if}
	<ActionButton kind="primary" isBusy={isBuilding} busyText="Building…" disabled={!canBuild} onclick={onbuild}>
		Build the next task
	</ActionButton>
</div>
