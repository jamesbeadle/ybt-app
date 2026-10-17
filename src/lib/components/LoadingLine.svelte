<script lang="ts">
	import Spinner from './Spinner.svelte';

	let { text }: { text: string } = $props();
</script>

<p class="flex items-center gap-2 text-sm text-etch">
	<Spinner class="size-3.5" />
	<span>{text}</span>
</p>
