<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const sections = [
		{ href: '/', label: 'Connections' },
		{ href: '/chat', label: 'Chat' },
		{ href: '/settings', label: 'Settings' }
	];
</script>

<header class="flex items-center gap-6 border-b border-hairline px-6 py-3">
	<span class="font-display text-lg font-bold">YBT Desktop</span>
	<nav class="flex gap-4 text-etch">
		{#each sections as section (section.href)}<a class="hover:text-chalk" href={section.href}>{section.label}</a>{/each}
	</nav>
</header>

<main class="mx-auto grid max-w-4xl gap-6 p-6">
	{@render children()}
</main>
