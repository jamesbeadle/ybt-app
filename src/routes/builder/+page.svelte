<script lang="ts">
	import { untrack } from 'svelte';
	import BuildHistoryList from '$lib/components/BuildHistoryList.svelte';
	import BuilderControls from '$lib/components/BuilderControls.svelte';
	import BuilderSetupForm from '$lib/components/BuilderSetupForm.svelte';
	import ClaimedTaskCard from '$lib/components/ClaimedTaskCard.svelte';
	import ModelChoiceRow from '$lib/components/ModelChoiceRow.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import StepList from '$lib/components/StepList.svelte';
	import { BuildBoard } from '$lib/board/buildBoard.svelte';
	import { saveBuilderSettings } from '$lib/builder/builderStore';
	import { LocalBuilder } from '$lib/builder/localBuilder.svelte';
	import { chosenTier, escalationTier } from '$lib/builder/modelTiers';
	import { ChatModelChoice } from '$lib/lmStudio/chatModelChoice.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { settings, builderSettings, buildHistory } = untrack(() => data);
	const { lmStudioOrigin } = settings;
	const board = new BuildBoard();
	const choice = new ChatModelChoice(lmStudioOrigin);
	let buildsFolder = $state(builderSettings.buildsFolder);
	let tierModelId = $state(builderSettings.tierModelId);

	let escalation = $derived(escalationTier(board.models, tierModelId, board.reviewModelId));
	let nextTierModelId = $derived(escalation === null ? '' : escalation.modelId);
	let nextTierLabel = $derived(escalation === null ? '' : escalation.label);
	const builder = new LocalBuilder(buildHistory, () => ({
		lmStudioOrigin,
		buildsFolder: buildsFolder.trim(),
		model: choice.modelId,
		tierModelId,
		nextTierModelId
	}));
	let isSetUp = $derived(choice.hasModel && tierModelId !== '' && buildsFolder.trim() !== '');
	let canBuild = $derived(isSetUp && !builder.isBuilding);

	function rememberSetup() {
		void saveBuilderSettings({ buildsFolder: buildsFolder.trim(), tierModelId });
	}

	$effect(() => void choice.read());
	$effect(() => void board.load());
	$effect(() => {
		if (!board.hasLoaded) return;
		const chosenTierModelId = untrack(() => tierModelId);
		tierModelId = chosenTier(board.models, chosenTierModelId);
	});
</script>

<div class="flex items-center justify-between gap-3">
	<h1 class="font-display text-xl font-bold">Local builder</h1>
	<BuilderControls
		{canBuild}
		isBuilding={builder.isBuilding}
		isKeepingGoing={builder.isKeepingGoing}
		onbuild={() => void builder.buildNext()}
		onkeepgoing={() => void builder.keepGoing()}
		onstop={() => builder.stop()}
	/>
</div>
<p class="text-etch">
	Takes the next buildable task YBT holds for the tier chosen here, builds it on a branch with the local model, runs the
	repository's checks, pushes the branch and hands it to the review model, which opens the pull request.
</p>
<Panel title="Set-up">
	<ModelChoiceRow {choice} />
	<BuilderSetupForm
		models={board.models}
		bind:buildsFolder
		bind:tierModelId
		{nextTierLabel}
		disabled={builder.isBuilding}
		onchange={rememberSetup}
	/>
</Panel>
{#if board.problem !== ''}<p class="text-signal">{board.problem}</p>{/if}
{#if builder.problem !== ''}<p class="text-signal">{builder.problem}</p>{/if}
{#if builder.notice !== ''}
	<p class="rounded-lg border border-dashed border-hairline px-3 py-4 text-center text-sm text-mist">{builder.notice}</p>
{/if}
{#if builder.current !== null}<ClaimedTaskCard build={builder.current} />{/if}
<StepList feed={builder.feed} />
<BuildHistoryList records={builder.history} />
