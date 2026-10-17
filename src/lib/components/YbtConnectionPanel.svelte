<script lang="ts">
	import ActionButton from './ActionButton.svelte';
	import Panel from './Panel.svelte';
	import StatusLine from './StatusLine.svelte';
	import { hasAnsweredFor, rememberedConnections } from '$lib/connections/connectionMemory.svelte';
	import { checkYbtAccount, confirmYbtAccount } from '$lib/connections/ybtConnection';
	import { failureText } from '$lib/failures/failureText';
	import { phaseOf } from '$lib/status/statusPhase';
	import { signInToYbt, signOutOfYbt } from '$lib/ybt/signIn';

	let { ybtOrigin }: { ybtOrigin: string } = $props();

	const memory = rememberedConnections.ybt;
	let signInProblem = $state('');
	let isSigningIn = $state(false);
	let isSigningOut = $state(false);

	const hasAnswered = $derived(hasAnsweredFor(memory, ybtOrigin));
	const account = $derived(memory.account);
	const phase = $derived(phaseOf(hasAnswered, account !== null));
	const statusText = $derived(
		account === null ? `Not signed in to ${ybtOrigin}.` : `Signed in as ${account.email}`
	);
	const detailText = $derived(account === null ? '' : [account.standing, account.projects].filter(Boolean).join(' · '));
	const problem = $derived(signInProblem === '' ? memory.problem : signInProblem);

	async function signIn() {
		signInProblem = '';
		isSigningIn = true;
		await signInToYbt(ybtOrigin).catch((failure: unknown) => (signInProblem = failureText(failure)));
		await confirmYbtAccount(ybtOrigin);
		isSigningIn = false;
	}

	async function signOut() {
		isSigningOut = true;
		await signOutOfYbt();
		await confirmYbtAccount(ybtOrigin);
		isSigningOut = false;
	}

	$effect(() => void checkYbtAccount(ybtOrigin));
</script>

<Panel title="Your Business Today">
	{#if hasAnswered}
		<StatusLine {phase} text={statusText} />
		{#if detailText !== ''}<p class="mt-1 pl-5 text-sm text-mist">{detailText}</p>{/if}
	{:else}
		<StatusLine {phase} text="Checking your YBT sign-in…" />
	{/if}
	{#if problem !== ''}<p class="mt-2 text-sm text-signal">{problem}</p>{/if}
	<div class="mt-4">
		{#if !hasAnswered}
			<ActionButton isBusy busyText="Checking…">Checking</ActionButton>
		{:else if account === null}
			<ActionButton kind="primary" isBusy={isSigningIn} busyText="Waiting for the browser…" onclick={signIn}>
				Sign in to YBT
			</ActionButton>
		{:else}
			<ActionButton isBusy={isSigningOut} busyText="Signing out…" onclick={signOut}>Sign out</ActionButton>
		{/if}
	</div>
</Panel>
