<script lang="ts">
	import { fetch as desktopFetch } from '@tauri-apps/plugin-http';
	import { untrack } from 'svelte';
	import ChatComposer from '$lib/components/ChatComposer.svelte';
	import ChatTranscript from '$lib/components/ChatTranscript.svelte';
	import ModelPicker from '$lib/components/ModelPicker.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import { DesktopChat } from '$lib/chat/desktopChat.svelte';
	import { listLocalModels } from '$lib/lmStudio/lmStudio';
	import { chatModels, preferredModel } from '$lib/lmStudio/preferredModel';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { settings } = untrack(() => data);
	const { lmStudioOrigin } = settings;
	const chat = new DesktopChat(lmStudioOrigin);
	let models = $state<string[]>([]);
	let modelId = $state('');

	async function readModels() {
		const served = await listLocalModels(desktopFetch, lmStudioOrigin).catch(() => []);
		models = chatModels(served);
		modelId = preferredModel(served);
	}

	$effect(() => void readModels());
</script>

<Panel title="Talk to the local model">
	<div class="mb-4 flex items-center justify-between">
		<ModelPicker {models} bind:modelId />
		<button class="rounded-lg border border-hairline px-3 py-1.5" onclick={() => chat.startAgain()}>Start again</button>
	</div>
	{#if modelId === ''}
		<p class="text-caution">LM Studio is serving no chat model at {lmStudioOrigin}. Load one in LM Studio first.</p>
	{/if}
	<ChatTranscript messages={chat.messages} />
	{#if chat.problem !== ''}<p class="my-3 text-signal">{chat.problem}</p>{/if}
	<div class="mt-4"><ChatComposer isThinking={chat.isThinking} onsend={(text) => chat.send(text, modelId)} /></div>
</Panel>
