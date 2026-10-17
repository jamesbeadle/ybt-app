<script lang="ts">
	import { chatLimits } from '$lib/chat/chatLimits';

	let { isThinking, onsend }: { isThinking: boolean; onsend: (text: string) => void } = $props();

	let text = $state('');

	function send(event: SubmitEvent) {
		event.preventDefault();
		const message = text.trim();
		if (message === '' || message.length > chatLimits.longestMessage) return;
		onsend(message);
		text = '';
	}
</script>

<form class="flex gap-3" onsubmit={send}>
	<textarea
		class="min-h-20 flex-1 rounded-lg border border-hairline bg-night px-3 py-2"
		placeholder="Ask the local model to raise, read or update work in YBT"
		required
		maxlength={chatLimits.longestMessage}
		bind:value={text}
	></textarea>
	<button class="self-end rounded-lg bg-signal px-4 py-2 font-medium" disabled={isThinking}>
		{isThinking ? 'Thinking…' : 'Send'}
	</button>
</form>
