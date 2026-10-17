<script lang="ts">
	import type { Snippet } from 'svelte';
	import ActionButton from './ActionButton.svelte';
	import LoadingLine from './LoadingLine.svelte';
	import ModelChoiceNotice from './ModelChoiceNotice.svelte';
	import ModelPicker from './ModelPicker.svelte';
	import type { ChatModelChoice } from '$lib/lmStudio/chatModelChoice.svelte';

	let { choice, children }: { choice: ChatModelChoice; children?: Snippet } = $props();
</script>

<div class="mb-4 flex items-center justify-between gap-3">
	{#if choice.isReading}
		<LoadingLine text="Asking LM Studio which models it serves…" />
	{:else}
		<ModelPicker models={choice.models} bind:modelId={choice.modelId} />
	{/if}
	<div class="flex items-center gap-2">
		<ActionButton isBusy={choice.isReading} busyText="Checking…" onclick={() => void choice.read()}>Check again</ActionButton>
		{@render children?.()}
	</div>
</div>
<ModelChoiceNotice {choice} />
