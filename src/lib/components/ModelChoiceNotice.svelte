<script lang="ts">
	import type { ChatModelChoice } from '$lib/lmStudio/chatModelChoice.svelte';

	let { choice }: { choice: ChatModelChoice } = $props();
</script>

{#if choice.isNotAnswering}
	<p class="mb-3 text-sm text-signal">
		LM Studio is not answering at {choice.lmStudioOrigin}: {choice.problem} Start its server in LM Studio's Developer tab.
	</p>
{:else if choice.isServingNone}
	<p class="mb-3 text-sm text-caution">
		LM Studio is serving no chat model at {choice.lmStudioOrigin}. Load one in LM Studio first.
	</p>
{/if}
