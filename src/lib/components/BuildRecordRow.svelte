<script lang="ts">
	import { fly } from 'svelte/transition';
	import { rowEntrance } from '$lib/motion/entrances';
	import { buildOutcomes, commitPhrase, type BuildRecord } from '$lib/builder/buildOutcome';
	import ExternalLink from './ExternalLink.svelte';

	let { record }: { record: BuildRecord } = $props();

	const outcomeWords = {
		[buildOutcomes.handedToReview]: 'Handed to review',
		[buildOutcomes.released]: 'Given back',
		[buildOutcomes.setAside]: 'Set aside'
	};
	const outcomeColours = {
		[buildOutcomes.handedToReview]: 'text-go',
		[buildOutcomes.released]: 'text-signal',
		[buildOutcomes.setAside]: 'text-caution'
	};
	const dotColours = {
		[buildOutcomes.handedToReview]: 'bg-go',
		[buildOutcomes.released]: 'bg-signal',
		[buildOutcomes.setAside]: 'bg-caution'
	};

	let when = $derived(new Date(record.finishedAt).toLocaleString());
	let detailLine = $derived(`${record.projectName} · ${commitPhrase(record.commitCount)} · ${when}`);
	let [noteLead, ...noteOutput] = $derived(record.note.split('\n'));
	let output = $derived(noteOutput.join('\n'));
	let hasOutput = $derived(output !== '');
	let hasDiff = $derived(record.diffStat !== '');
	let hasCompareUrl = $derived(record.compareUrl !== '');
</script>

<li class="rounded-lg border border-hairline bg-night p-3" in:fly={rowEntrance()}>
	<div class="flex items-start justify-between gap-3">
		<div>
			<h3 class="font-medium">{record.title}</h3>
			<p class="text-sm text-etch">{detailLine}</p>
		</div>
		<p class="flex shrink-0 items-center gap-2 text-sm {outcomeColours[record.outcome]}">
			<span class="size-2.5 rounded-full {dotColours[record.outcome]}"></span>
			<span>{outcomeWords[record.outcome]}</span>
		</p>
	</div>
	<p class="mt-1 text-sm text-etch">
		{#if hasCompareUrl}
			<ExternalLink href={record.compareUrl}>{record.branch}</ExternalLink>
		{:else}
			{record.branch}
		{/if}
	</p>
	<p class="mt-1 text-sm text-etch">{noteLead}</p>
	{#if record.ybtAnswer !== ''}<p class="mt-1 text-sm text-mist">{record.ybtAnswer}</p>{/if}
	{#if hasOutput}
		<details class="mt-2">
			<summary class="text-sm text-etch">Last output</summary>
			<pre class="mt-2 max-h-72 overflow-auto rounded-lg bg-carriage p-3 text-sm whitespace-pre-wrap text-etch">{output}</pre>
		</details>
	{/if}
	{#if hasDiff}
		<details class="mt-2">
			<summary class="text-sm text-etch">What changed</summary>
			<pre class="mt-2 max-h-72 overflow-auto rounded-lg bg-carriage p-3 text-sm text-etch">{record.diffStat}</pre>
		</details>
	{/if}
</li>
