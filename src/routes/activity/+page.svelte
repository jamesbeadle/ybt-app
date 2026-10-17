<script lang="ts">
	import { untrack } from 'svelte';
	import ActivityStepRow from '$lib/components/ActivityStepRow.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import ServedModelRow from '$lib/components/ServedModelRow.svelte';
	import StatusLine from '$lib/components/StatusLine.svelte';
	import { ModelActivity, refreshSeconds } from '$lib/activity/modelActivity.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { settings } = untrack(() => data);
	const activity = new ModelActivity(settings.lmStudioOrigin);

	$effect(() => activity.follow());
</script>

<Panel title="Running on this Mac">
	{#if activity.modelProblem !== ''}
		<StatusLine isGood={false} text={activity.modelProblem} />
	{:else}
		<StatusLine isGood={activity.loadedModelCount > 0} text="{activity.loadedModelCount} model(s) loaded in LM Studio." />
		<ul class="mt-2 grid gap-1">
			{#each activity.models as model (model.id)}<ServedModelRow {model} />{/each}
		</ul>
	{/if}
</Panel>

<Panel title="What the AIs are deciding">
	<p class="mb-3 text-etch">
		The newest steps any AI recorded on your tasks: what it considered, claimed, built or handed back, and why. Refreshes
		every {refreshSeconds} seconds{activity.refreshedAt === '' ? '' : `, last at ${activity.refreshedAt}`}.
	</p>
	{#if activity.stepProblem !== ''}
		<p class="text-signal">{activity.stepProblem}</p>
	{:else if !activity.hasSteps}
		<p class="text-etch">No AI has recorded a step yet.</p>
	{/if}
	<ol class="grid gap-3">
		{#each activity.steps as step (step.id)}<ActivityStepRow {step} />{/each}
	</ol>
</Panel>
