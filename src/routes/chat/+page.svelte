<script lang="ts">
	import { untrack } from 'svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import ChatComposer from '$lib/components/ChatComposer.svelte';
	import ChatTranscript from '$lib/components/ChatTranscript.svelte';
	import ModelChoiceRow from '$lib/components/ModelChoiceRow.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import { DesktopChat } from '$lib/chat/desktopChat.svelte';
	import { ChatModelChoice } from '$lib/lmStudio/chatModelChoice.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { settings } = untrack(() => data);
	const { lmStudioOrigin } = settings;
	const chat = new DesktopChat(lmStudioOrigin);
	const choice = new ChatModelChoice(lmStudioOrigin);

	$effect(() => void choice.read());
</script>

<Panel title="Talk to the local model">
	<ModelChoiceRow {choice}>
		<ActionButton onclick={() => chat.startAgain()}>Start again</ActionButton>
	</ModelChoiceRow>
	<ChatTranscript messages={chat.messages} isThinking={chat.isThinking} />
	{#if chat.problem !== ''}<p class="my-3 text-signal">{chat.problem}</p>{/if}
	<div class="mt-4">
		<ChatComposer isThinking={chat.isThinking} canSend={choice.hasModel} onsend={(text) => chat.send(text, choice.modelId)} />
	</div>
</Panel>
