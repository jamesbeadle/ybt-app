<script lang="ts">
	import ModelTiersPanel from '$lib/components/ModelTiersPanel.svelte';
	import SettingsForm from '$lib/components/SettingsForm.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<SettingsForm settings={data.settings} />
<ModelTiersPanel />
