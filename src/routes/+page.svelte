<script lang="ts">
	import LmStudioPanel from '$lib/components/LmStudioPanel.svelte';
	import YbtConnectionPanel from '$lib/components/YbtConnectionPanel.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let settings = $derived(data.settings);
</script>

<YbtConnectionPanel ybtOrigin={settings.ybtOrigin} />
<LmStudioPanel lmStudioOrigin={settings.lmStudioOrigin} />
