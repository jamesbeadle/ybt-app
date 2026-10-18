<script lang="ts">
	import type { BuildRecord } from '$lib/builder/buildOutcome';
	import BuildRecordRow from './BuildRecordRow.svelte';
	import EmptyNotice from './EmptyNotice.svelte';
	import Panel from './Panel.svelte';

	let { records }: { records: BuildRecord[] } = $props();

	let hasRecords = $derived(records.length > 0);
</script>

<Panel title="Branches built here">
	{#if hasRecords}
		<ol class="grid gap-3">
			{#each records as record (`${record.taskId} ${record.finishedAt}`)}<BuildRecordRow {record} />{/each}
		</ol>
	{:else}
		<EmptyNotice>No branch has been built on this machine yet.</EmptyNotice>
	{/if}
</Panel>
