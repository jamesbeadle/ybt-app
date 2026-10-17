<script lang="ts">
	import type { ToolCall } from '$lib/chat/chatMessages';

	let { toolCall }: { toolCall: ToolCall } = $props();

	let call = $derived(toolCall.function);
</script>

<details class="text-sm text-etch">
	<summary>Asked YBT: {call.name}</summary>
	<pre class="mt-1 whitespace-pre-wrap">{call.arguments}</pre>
</details>
