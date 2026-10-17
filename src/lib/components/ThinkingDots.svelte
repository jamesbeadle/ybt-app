<script lang="ts">
	let { text = 'Thinking' }: { text?: string } = $props();

	const dotDelays = ['[animation-delay:0ms]', '[animation-delay:150ms]', '[animation-delay:300ms]'];
</script>

<p class="flex items-center gap-2 text-sm text-etch" role="status" aria-label={text}>
	<span class="flex items-end gap-1">
		{#each dotDelays as delay (delay)}
			<span class="size-1.5 animate-bounce rounded-full bg-etch {delay}"></span>
		{/each}
	</span>
	<span>{text}</span>
</p>
