<script lang="ts">
	import { statusDotClasses, statusTextClasses, type StatusPhase } from '$lib/status/statusPhase';

	let { phase, text }: { phase: StatusPhase; text: string } = $props();
</script>

<p class="flex items-center gap-2.5 transition-colors duration-300 {statusTextClasses[phase]}">
	<span class="size-2.5 shrink-0 rounded-full transition-colors duration-300 {statusDotClasses[phase]}"></span>
	<span>{text}</span>
</p>
