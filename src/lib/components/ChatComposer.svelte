<script lang="ts">
	import { chatLimits } from '$lib/chat/chatLimits';
	import ActionButton from './ActionButton.svelte';

	let {
		isThinking,
		canSend,
		onsend
	}: { isThinking: boolean; canSend: boolean; onsend: (text: string) => void } = $props();

	let text = $state('');

	function send(event: SubmitEvent) {
		event.preventDefault();
		const message = text.trim();
		if (message === '' || message.length > chatLimits.longestMessage) return;
		onsend(message);
		text = '';
	}
</script>

<form class="flex items-end gap-3" onsubmit={send}>
	<textarea
		class="field min-h-20 flex-1 resize-y"
		placeholder="Ask the local model to raise, read or update work in YBT"
		required
		maxlength={chatLimits.longestMessage}
		bind:value={text}
	></textarea>
	<ActionButton kind="primary" type="submit" isBusy={isThinking} busyText="Thinking…" disabled={!canSend}>
		Send
	</ActionButton>
</form>
