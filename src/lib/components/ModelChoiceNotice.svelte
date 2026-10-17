<script lang="ts">
	import type { ChatModelChoice } from '$lib/lmStudio/chatModelChoice.svelte';
	import { notAnsweringPhrase, startServerHint } from '$lib/connections/lmStudioConnection';

	let { choice }: { choice: ChatModelChoice } = $props();
</script>

{#if choice.isNotAnswering}
	<p class="mb-3 text-sm text-signal">
		{notAnsweringPhrase(choice.lmStudioOrigin)} {startServerHint(choice.problem)}
	</p>
{:else if choice.isServingNone}
	<p class="mb-3 text-sm text-caution">
		LM Studio is serving no chat model at {choice.lmStudioOrigin}. Load one in LM Studio first.
	</p>
{/if}
