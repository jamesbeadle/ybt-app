<script lang="ts">
	import type { Snippet } from 'svelte';
	import Spinner from './Spinner.svelte';

	type ButtonKind = 'primary' | 'quiet';

	let {
		kind = 'quiet',
		type = 'button',
		isBusy = false,
		busyText = '',
		disabled = false,
		onclick,
		children
	}: {
		kind?: ButtonKind;
		type?: 'button' | 'submit';
		isBusy?: boolean;
		busyText?: string;
		disabled?: boolean;
		onclick?: () => void;
		children: Snippet;
	} = $props();

	const kindClasses: Record<ButtonKind, string> = {
		primary: 'bg-signal text-white shadow-sm shadow-signal/20 hover:brightness-110',
		quiet: 'border border-hairline bg-transparent text-chalk hover:border-mist hover:bg-ink'
	};

	const shapeClasses = 'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium';
	const feedbackClasses = 'transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100';

	const isUnavailable = $derived(disabled || isBusy);
</script>

<button
	class="{shapeClasses} {feedbackClasses} {kindClasses[kind]}"
	{type}
	disabled={isUnavailable}
	aria-busy={isBusy}
	{onclick}
>
	{#if isBusy}
		<Spinner class="size-3.5" />
		<span>{busyText}</span>
	{:else}
		{@render children()}
	{/if}
</button>
