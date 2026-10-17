<script lang="ts">
	import { statusDotClasses, statusTextClasses, type StatusPhase } from '$lib/status/statusPhase';

	let { phase, text }: { phase: StatusPhase; text: string } = $props();
</script>

<p class="flex items-start gap-2.5 transition-colors duration-300 {statusTextClasses[phase]}">
	<span class="mt-1.5 size-2.5 shrink-0 rounded-full transition-colors duration-300 {statusDotClasses[phase]}"></span>
	<span>{text}</span>
</p>
