<script lang="ts">
	import type { Snippet } from 'svelte';
	import { openUrl } from '@tauri-apps/plugin-opener';

	let { href, class: className = '', children }: { href: string; class?: string; children: Snippet } = $props();

	function openInBrowser(event: MouseEvent) {
		event.preventDefault();
		void openUrl(href);
	}
</script>

<a
	{href}
	class="underline decoration-hairline underline-offset-2 transition-colors duration-150 hover:text-chalk hover:decoration-mist {className}"
	onclick={openInBrowser}
>
	{@render children()}
</a>
