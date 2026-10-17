<script lang="ts">
	import '@fontsource-variable/inter';
	import '@fontsource-variable/space-grotesk';
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
	import AppBrand from '$lib/components/AppBrand.svelte';
	import AppNavigation from '$lib/components/AppNavigation.svelte';

	let { children }: { children: Snippet } = $props();

	const currentUrl = $derived(page.url);
	const pageEntrance = { y: 6, duration: 180 };
</script>

<header
	class="sticky top-0 z-10 flex h-13 items-center gap-6 border-b border-hairline bg-night/90 pr-6 pl-(--spacing-window-controls) backdrop-blur"
	data-tauri-drag-region
>
	<AppBrand />
	<AppNavigation />
</header>

<main class="mx-auto max-w-4xl p-6">
	{#key currentUrl.pathname}
		<div class="grid gap-6" in:fly={pageEntrance}>
			{@render children()}
		</div>
	{/key}
</main>
