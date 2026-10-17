<script lang="ts">
	let { class: className = 'size-4' }: { class?: string } = $props();
</script>

<span
	class="inline-block animate-spin rounded-full border-2 border-current border-t-transparent {className}"
	role="status"
	aria-label="Working"
></span>
