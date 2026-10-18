<script lang="ts">
	import { untrack } from 'svelte';
	import BuildHistoryList from '$lib/components/BuildHistoryList.svelte';
	import BuilderControls from '$lib/components/BuilderControls.svelte';
	import BuilderSetupForm from '$lib/components/BuilderSetupForm.svelte';
	import ClaimedTaskCard from '$lib/components/ClaimedTaskCard.svelte';
	import EmptyNotice from '$lib/components/EmptyNotice.svelte';
	import ModelChoiceRow from '$lib/components/ModelChoiceRow.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import StepList from '$lib/components/StepList.svelte';
	import { BuildBoard } from '$lib/board/buildBoard.svelte';
	import type { BuildSetup } from '$lib/builder/buildAttempt';
	import { saveBuilderSettings } from '$lib/builder/builderStore';
	import { localBuilder } from '$lib/builder/localBuilder.svelte';
	import { chosenTier, escalationTier } from '$lib/builder/modelTiers';
	import { ChatModelChoice } from '$lib/lmStudio/chatModelChoice.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { settings, builderSettings } = untrack(() => data);
	const { lmStudioOrigin } = settings;
	const board = new BuildBoard();
	const choice = new ChatModelChoice(lmStudioOrigin);
	let buildsFolder = $state(builderSettings.buildsFolder);
	let tierModelId = $state(builderSettings.tierModelId);

	let escalation = $derived(escalationTier(board.models, tierModelId, board.reviewModelId));
	let nextTierModelId = $derived(escalation === null ? '' : escalation.modelId);
	let nextTierLabel = $derived(escalation === null ? '' : escalation.label);
	let isSetUp = $derived(choice.hasModel && tierModelId !== '');
	let canBuild = $derived(isSetUp && !localBuilder.isBuilding);

	function buildSetup(): BuildSetup {
		return { lmStudioOrigin, buildsFolder: buildsFolder.trim(), model: choice.modelId, tierModelId, nextTierModelId };
	}

	function rememberSetup() {
		void saveBuilderSettings({ buildsFolder: buildsFolder.trim(), tierModelId });
	}

	$effect(() => void choice.read());
	$effect(() => void board.load());
	$effect(() => {
		if (!board.hasLoaded || board.problem !== '') return;
		const chosenTierModelId = untrack(() => tierModelId);
		tierModelId = chosenTier(board.models, chosenTierModelId);
	});
</script>

<div class="flex items-center justify-between gap-3">
	<h1 class="font-display text-xl font-bold">Local builder</h1>
	<BuilderControls
		{canBuild}
		isBuilding={localBuilder.isBuilding}
		isKeepingGoing={localBuilder.isKeepingGoing}
		onbuild={() => void localBuilder.buildNext(buildSetup())}
		onkeepgoing={() => void localBuilder.keepGoing(buildSetup)}
		onstop={() => localBuilder.stop()}
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
		hasLoadedTiers={board.hasLoaded}
		bind:buildsFolder
		bind:tierModelId
		{nextTierLabel}
		disabled={localBuilder.isBuilding}
		onchange={rememberSetup}
	/>
</Panel>
{#if board.problem !== ''}<p class="text-signal">{board.problem}</p>{/if}
{#if localBuilder.problem !== ''}<p class="text-signal">{localBuilder.problem}</p>{/if}
{#if localBuilder.notice !== ''}<EmptyNotice>{localBuilder.notice}</EmptyNotice>{/if}
{#if localBuilder.current !== null}<ClaimedTaskCard build={localBuilder.current} />{/if}
<StepList feed={localBuilder.feed} />
<BuildHistoryList records={localBuilder.history} />
