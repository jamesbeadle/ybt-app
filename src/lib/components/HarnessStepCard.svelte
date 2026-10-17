<script lang="ts">
	import { fly } from 'svelte/transition';
	import { stepStates, type HarnessStepView, type StepState } from '$lib/harness/harnessEvents';
	import Spinner from './Spinner.svelte';

	let { step }: { step: HarnessStepView } = $props();

	const stateWords: Record<StepState, string> = { running: 'Running', passed: 'Passed', failed: 'Failed' };
	const stateColours: Record<StepState, string> = { running: 'text-caution', passed: 'text-go', failed: 'text-signal' };
	const dotColours: Record<StepState, string> = { running: 'bg-caution', passed: 'bg-go', failed: 'bg-signal' };

	let isRunning = $derived(step.state === stepStates.running);
	let isOpen = $derived(isRunning || step.state === stepStates.failed);
	let outcome = $derived(isRunning ? stateWords.running : `${stateWords[step.state]} in ${step.seconds}s`);
</script>

<li class="rounded-lg border border-hairline bg-carriage p-3 transition-colors duration-150" in:fly={{ y: 6, duration: 160 }}>
	<details open={isOpen}>
		<summary class="flex cursor-pointer items-center justify-between gap-3">
			<span class="flex items-center gap-2.5">
				{#if isRunning}
					<Spinner class="size-3.5 text-caution" />
				{:else}
					<span class="size-2.5 rounded-full {dotColours[step.state]}"></span>
				{/if}
				<span>{step.title}</span>
			</span>
			<span class="text-sm {stateColours[step.state]}">{outcome}</span>
		</summary>
		<pre class="mt-3 max-h-96 overflow-auto rounded-lg bg-night p-3 text-sm whitespace-pre-wrap text-etch">{step.lines.join('\n')}</pre>
	</details>
</li>
