<script lang="ts">
	import { taskPlaceLine, taskStanding } from '$lib/board/taskStanding';
	import type { BuildQueueEntry } from '$lib/board/buildQueue';

	let { task }: { task: BuildQueueEntry } = $props();

	let standing = $derived(taskStanding(task));
</script>

<article class="rounded-lg border border-hairline bg-night p-3">
	<h3 class="font-medium">{task.title}</h3>
	<p class="text-sm text-etch">{taskPlaceLine(task)}</p>
	<p class="mt-1 text-sm {standing.isFree ? 'text-go' : 'text-caution'}">{standing.sentence}</p>
</article>
