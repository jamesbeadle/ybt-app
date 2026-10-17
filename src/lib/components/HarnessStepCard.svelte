<script lang="ts">
	import { stepStates, type HarnessStepView } from '$lib/harness/harnessEvents';

	let { step }: { step: HarnessStepView } = $props();

	const stateWords = { running: 'Running', passed: 'Passed', failed: 'Failed' };
	const stateColours = { running: 'text-caution', passed: 'text-go', failed: 'text-signal' };

	let isRunning = $derived(step.state === stepStates.running);
</script>

<li class="rounded-lg border border-hairline p-3">
	<details open={isRunning || step.state === stepStates.failed}>
		<summary class="flex cursor-pointer justify-between gap-3">
			<span>{step.title}</span>
			<span class={stateColours[step.state]}>{stateWords[step.state]}{isRunning ? '' : ` in ${step.seconds}s`}</span>
		</summary>
		<pre class="mt-2 max-h-96 overflow-auto text-sm whitespace-pre-wrap text-etch">{step.lines.join('\n')}</pre>
	</details>
</li>
