<script lang="ts">
	import Panel from './Panel.svelte';
	import StatusLine from './StatusLine.svelte';
	import { readSession } from '$lib/desktopStore';
	import { performAction } from '$lib/ybt/ybtConnector';
	import { signInToYbt, signOutOfYbt } from '$lib/ybt/signIn';

	let { ybtOrigin }: { ybtOrigin: string } = $props();

	let account = $state('');
	let problem = $state('');
	let isWorking = $state(false);

	async function readAccount() {
		problem = '';
		const session = await readSession();
		if (session === null) return void (account = '');
		account = await performAction('who_am_i').catch((failure: Error) => ((problem = failure.message), ''));
	}

	async function signIn() {
		isWorking = true;
		await signInToYbt(ybtOrigin).catch((failure: Error) => (problem = failure.message));
		isWorking = false;
		await readAccount();
	}

	async function signOut() {
		await signOutOfYbt();
		await readAccount();
	}

	$effect(() => void readAccount());
</script>

<Panel title="Your Business Today">
	{#if account !== ''}
		<StatusLine isGood={true} text={account} />
		<button class="mt-3 rounded-lg border border-hairline px-3 py-1.5" onclick={signOut}>Sign out</button>
	{:else}
		<StatusLine isGood={false} text="Not signed in to {ybtOrigin}." />
		<button class="mt-3 rounded-lg bg-signal px-3 py-1.5 font-medium" disabled={isWorking} onclick={signIn}>
			{isWorking ? 'Waiting for the browser…' : 'Sign in to YBT'}
		</button>
	{/if}
	{#if problem !== ''}<p class="mt-2 text-signal">{problem}</p>{/if}
</Panel>
