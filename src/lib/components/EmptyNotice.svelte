<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<p class="rounded-lg border border-dashed border-hairline px-3 py-4 text-center text-sm text-mist">{@render children()}</p>
