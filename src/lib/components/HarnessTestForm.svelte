<script lang="ts">
	import { harnessLimits } from '$lib/harness/harnessEvents';
	import ModelPicker from './ModelPicker.svelte';

	type TestChoice = { checkout: string; taskText: string; model: string };

	let {
		models,
		modelId = $bindable(),
		checkout = $bindable(),
		isRunning,
		onrun
	}: { models: string[]; modelId: string; checkout: string; isRunning: boolean; onrun: (choice: TestChoice) => void } =
		$props();

	let taskText = $state('');

	function run(event: SubmitEvent) {
		event.preventDefault();
		const task = taskText.trim();
		if (task === '' || checkout.trim() === '') return;
		onrun({ checkout: checkout.trim(), taskText: task, model: modelId });
	}
</script>

<form class="grid gap-3" onsubmit={run}>
	<ModelPicker {models} bind:modelId />
	<label class="grid gap-1 text-etch">
		<span>The repository's folder on this Mac</span>
		<input
			class="rounded-lg border border-hairline bg-night px-3 py-2 text-chalk"
			placeholder="/Users/you/ybt-builds/YourBusinessToday"
			required
			maxlength={harnessLimits.longestCheckoutPath}
			bind:value={checkout}
		/>
	</label>
	<label class="grid gap-1 text-etch">
		<span>The task to build</span>
		<textarea
			class="min-h-28 rounded-lg border border-hairline bg-night px-3 py-2 text-chalk"
			placeholder="Paste an easy task's title and details"
			required
			maxlength={harnessLimits.longestTaskText}
			bind:value={taskText}
		></textarea>
	</label>
	<button class="justify-self-start rounded-lg bg-signal px-4 py-2 font-medium" disabled={isRunning || modelId === ''}>
		{isRunning ? 'Running the test…' : 'Run the test'}
	</button>
</form>
