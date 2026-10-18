<script lang="ts">
	import { fly } from 'svelte/transition';
	import { rowEntrance } from '$lib/motion/entrances';
	import type { CurrentBuild } from '$lib/builder/localBuilder.svelte';
	import ExternalLink from './ExternalLink.svelte';
	import Spinner from './Spinner.svelte';

	let { build }: { build: CurrentBuild } = $props();

	const { task, branch } = $derived(build);
	let detailLine = $derived(`${task.projectName} · ${task.storyPoints} points · ${branch}`);
	let hasRepository = $derived(task.repositoryUrl !== '');
</script>

<article class="rounded-lg border border-caution/40 bg-carriage p-4" in:fly={rowEntrance()}>
	<p class="mb-1 flex items-center gap-2 text-xs font-medium tracking-wide text-caution uppercase">
		<Spinner class="size-3" />
		<span>Building now</span>
	</p>
	<h3 class="font-medium">{task.title}</h3>
	<p class="text-sm text-etch">{detailLine}</p>
	{#if hasRepository}
		<p class="mt-1 text-sm text-etch"><ExternalLink href={task.repositoryUrl}>{task.repositoryUrl}</ExternalLink></p>
	{/if}
</article>
