<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<section class="rounded-xl border border-hairline bg-carriage p-5">
	<h2 class="mb-3 font-display text-lg font-medium">{title}</h2>
	{@render children()}
</section>
