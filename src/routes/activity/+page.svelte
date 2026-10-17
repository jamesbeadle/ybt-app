<script lang="ts">
	import { untrack } from 'svelte';
	import ActivityStepRow from '$lib/components/ActivityStepRow.svelte';
	import LoadingLine from '$lib/components/LoadingLine.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import ServedModelRow from '$lib/components/ServedModelRow.svelte';
	import StatusLine from '$lib/components/StatusLine.svelte';
	import { ModelActivity, refreshSeconds } from '$lib/activity/modelActivity.svelte';
	import { modelCountPhrase } from '$lib/connections/lmStudioConnection';
	import { phaseOf } from '$lib/status/statusPhase';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { settings } = untrack(() => data);
	const activity = new ModelActivity(settings.lmStudioOrigin);

	let hasModelLoaded = $derived(activity.modelProblem === '' && activity.loadedModelCount > 0);
	let modelPhase = $derived(phaseOf(activity.hasRefreshed, hasModelLoaded));
	let modelText = $derived.by(() => {
		if (!activity.hasRefreshed) return `Looking for LM Studio at ${settings.lmStudioOrigin}…`;
		if (activity.modelProblem !== '') return activity.modelProblem;
		return `LM Studio has ${modelCountPhrase(activity.loadedModelCount)} loaded.`;
	});
	let refreshedText = $derived(activity.refreshedAt === '' ? '' : `, last at ${activity.refreshedAt}`);

	$effect(() => activity.follow());
</script>

<Panel title="Running on this Mac">
	<StatusLine phase={modelPhase} text={modelText} />
	<ul class="mt-2 grid gap-1">
		{#each activity.models as model (model.id)}<ServedModelRow {model} />{/each}
	</ul>
</Panel>

<Panel title="What the AIs are deciding">
	<p class="mb-3 text-etch">
		The newest steps any AI recorded on your tasks: what it considered, claimed, built or handed back, and why. Refreshes
		every {refreshSeconds} seconds{refreshedText}.
	</p>
	{#if !activity.hasRefreshed}
		<LoadingLine text="Reading the latest steps from YBT…" />
	{:else if activity.stepProblem !== ''}
		<p class="text-signal">{activity.stepProblem}</p>
	{:else if !activity.hasSteps}
		<p class="rounded-lg border border-dashed border-hairline px-3 py-4 text-center text-sm text-mist">
			No AI has recorded a step yet.
		</p>
	{/if}
	<ol class="grid gap-3">
		{#each activity.steps as step (step.id)}<ActivityStepRow {step} />{/each}
	</ol>
</Panel>
