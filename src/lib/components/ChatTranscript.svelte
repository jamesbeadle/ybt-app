<script lang="ts">
	import { fly } from 'svelte/transition';
	import { rowEntrance } from '$lib/motion/entrances';
	import { chatRoles, type ChatMessage } from '$lib/chat/chatMessages';
	import ThinkingDots from './ThinkingDots.svelte';
	import ToolCallNote from './ToolCallNote.svelte';

	let { messages, isThinking }: { messages: ChatMessage[]; isThinking: boolean } = $props();

	let visibleMessages = $derived(messages.filter((message) => message.role !== chatRoles.system));
	let isEmpty = $derived(visibleMessages.length === 0 && !isThinking);
</script>

{#if isEmpty}
	<p class="rounded-lg border border-dashed border-hairline px-4 py-6 text-center text-sm text-mist">
		Nothing said yet. Try asking what is on your board today.
	</p>
{/if}
<ol class="grid gap-3">
	{#each visibleMessages as message, index (index)}
		<li in:fly={rowEntrance()}>
			{#if message.role === chatRoles.user}
				<p class="ml-auto max-w-[80%] rounded-xl bg-ink px-4 py-2 whitespace-pre-wrap">{message.content}</p>
			{:else if message.role === chatRoles.assistant}
				{#if message.content}<p class="max-w-[80%] whitespace-pre-wrap">{message.content}</p>{/if}
				{#each message.tool_calls ?? [] as toolCall (toolCall.id)}<ToolCallNote {toolCall} />{/each}
			{:else if message.role === chatRoles.tool}
				<details class="text-sm text-etch">
					<summary>YBT answered</summary>
					<pre class="mt-1 whitespace-pre-wrap">{message.content}</pre>
				</details>
			{/if}
		</li>
	{/each}
	{#if isThinking}
		<li in:fly={rowEntrance()}><ThinkingDots text="The local model is thinking" /></li>
	{/if}
</ol>
