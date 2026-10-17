<script lang="ts">
	let { isGood, text }: { isGood: boolean; text: string } = $props();
</script>

<p class={isGood ? 'text-go' : 'text-caution'}>{text}</p>
