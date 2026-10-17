<script lang="ts">
	import { stepSentence, type RecentStep } from '$lib/activity/recentSteps';

	let { step }: { step: RecentStep } = $props();

	const when = $derived(new Date(step.createdAt).toLocaleString());
</script>

<li class="grid gap-1 border-b border-hairline pb-3">
	<span>{stepSentence(step)}</span>
	{#if step.note !== ''}<span class="text-etch">{step.note}</span>{/if}
	<span class="text-sm text-etch">{when}</span>
</li>
