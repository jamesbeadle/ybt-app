<script lang="ts">
	import { harnessLimits } from '$lib/harness/harnessRequest';
	import { pathLimits } from '$lib/steps/pathLimits';
	import ActionButton from './ActionButton.svelte';

	type TestChoice = { checkout: string; taskText: string; model: string };

	let {
		modelId,
		checkout = $bindable(),
		isRunning,
		onrun
	}: { modelId: string; checkout: string; isRunning: boolean; onrun: (choice: TestChoice) => void } = $props();

	let taskText = $state('');

	function run(event: SubmitEvent) {
		event.preventDefault();
		const task = taskText.trim();
		if (task === '' || checkout.trim() === '') return;
		onrun({ checkout: checkout.trim(), taskText: task, model: modelId });
	}
</script>

<form class="grid gap-3" onsubmit={run}>
	<label class="grid gap-1 text-sm text-etch">
		<span>The repository's folder on this Mac</span>
		<input
			class="field"
			placeholder="/Users/you/ybt-builds/YourBusinessToday"
			required
			maxlength={pathLimits.longestPath}
			bind:value={checkout}
		/>
	</label>
	<label class="grid gap-1 text-sm text-etch">
		<span>The task to build</span>
		<textarea
			class="field min-h-28 resize-y"
			placeholder="Paste an easy task's title and details"
			required
			maxlength={harnessLimits.longestTaskText}
			bind:value={taskText}
		></textarea>
	</label>
	<div>
		<ActionButton kind="primary" type="submit" isBusy={isRunning} busyText="Running the test…" disabled={modelId === ''}>
			Run the test
		</ActionButton>
	</div>
</form>
