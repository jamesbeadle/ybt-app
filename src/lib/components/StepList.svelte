<script lang="ts">
	import StepCard from './StepCard.svelte';
	import type { StepFeed } from '$lib/steps/stepFeed.svelte';

	let { feed }: { feed: StepFeed } = $props();
</script>

<ol class="grid gap-3">
	{#each feed.steps as step, index (index)}<StepCard {step} />{/each}
</ol>
