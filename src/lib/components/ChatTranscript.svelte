<script lang="ts">
	import { chatRoles, type ChatMessage } from '$lib/chat/chatMessages';
	import ToolCallNote from './ToolCallNote.svelte';

	let { messages }: { messages: ChatMessage[] } = $props();

	let visibleMessages = $derived(messages.filter((message) => message.role !== chatRoles.system));
</script>

<ol class="grid gap-3">
	{#each visibleMessages as message, index (index)}
		<li>
			{#if message.role === chatRoles.user}
				<p class="ml-auto max-w-[80%] rounded-xl bg-hairline px-4 py-2 whitespace-pre-wrap">{message.content}</p>
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
</ol>
