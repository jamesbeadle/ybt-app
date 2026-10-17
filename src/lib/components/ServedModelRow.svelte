<script lang="ts">
	import type { ServedModel } from '$lib/lmStudio/servedModels';

	let { model }: { model: ServedModel } = $props();

	const details = $derived([model.kind, model.quantization, `${model.contextLength} token context`].filter(Boolean));
</script>

<li class="flex items-baseline gap-3">
	<span class={model.isLoaded ? 'text-go' : 'text-etch'}>{model.isLoaded ? 'Loaded' : 'Not loaded'}</span>
	<span class="font-medium">{model.id}</span>
	<span class="text-etch">{details.join(' · ')}</span>
</li>
