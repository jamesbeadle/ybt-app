<script lang="ts">
	import ModelRangesForm from '$lib/components/ModelRangesForm.svelte';
	import SettingsForm from '$lib/components/SettingsForm.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<SettingsForm settings={data.settings} />
<ModelRangesForm />
