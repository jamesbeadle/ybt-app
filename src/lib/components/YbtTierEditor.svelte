<script lang="ts">
	import { tick } from 'svelte';
	import ActionButton from './ActionButton.svelte';
	import PointRangeFields from './PointRangeFields.svelte';
	import type { BuildModel } from '$lib/board/buildQueue';
	import {
		buildModelLimits,
		draftOf,
		isSameDraft,
		saveYbtModel,
		trimmedDraft,
		validateYbtModel,
		type YbtModelDraft
	} from '$lib/board/saveYbtModel';
	import { failureText } from '$lib/failures/failureText';

	let { model, onsaved }: { model: BuildModel; onsaved: () => Promise<void> } = $props();

	let label = $derived(model.label);
	let runsOn = $derived(model.runsOn ?? '');
	let leastPoints = $derived(model.leastPoints);
	let mostPoints = $derived(model.mostPoints);
	let problem = $state('');
	let answer = $state('');
	let isSaving = $state(false);

	const draft = $derived({ label, runsOn, leastPoints, mostPoints });
	const isDirty = $derived(!isSameDraft(draft, draftOf(model)));

	async function save(event: SubmitEvent) {
		event.preventDefault();
		answer = '';
		problem = validateYbtModel(draft) ?? '';
		if (problem !== '') return;
		isSaving = true;
		const sent = trimmedDraft(draft);
		const sentence = await saveYbtModel(model.modelId, sent).catch((failure: unknown) => ((problem = failureText(failure)), ''));
		if (problem === '') await settle(sent, sentence);
		isSaving = false;
	}

	/** YBT answers a refusal as a plain sentence too, so whether the save took is read from the reloaded tier. */
	async function settle(sent: YbtModelDraft, sentence: string) {
		await onsaved();
		await tick();
		const didTake = isSameDraft(draftOf(model), sent);
		if (didTake) {
			answer = sentence;
			return;
		}
		problem = sentence;
		restore(sent);
	}

	function restore(sent: YbtModelDraft) {
		label = sent.label;
		runsOn = sent.runsOn;
		leastPoints = sent.leastPoints;
		mostPoints = sent.mostPoints;
	}
</script>

<form class="grid gap-3" onsubmit={save}>
	<label class="grid gap-1.5">
		<span class="text-sm text-etch">Name</span>
		<input class="field" required maxlength={buildModelLimits.longestLabel} bind:value={label} />
	</label>
	<label class="grid gap-1.5">
		<span class="text-sm text-etch">Runs on</span>
		<input class="field" placeholder="Such as Claude Opus 5.5" maxlength={buildModelLimits.longestRunsOn} bind:value={runsOn} />
	</label>
	<PointRangeFields bind:leastPoints bind:mostPoints />
	{#if problem !== ''}<p class="text-sm text-signal">{problem}</p>{/if}
	{#if answer !== ''}<p class="text-sm text-go">{answer}</p>{/if}
	<div>
		<ActionButton kind="primary" type="submit" isBusy={isSaving} busyText="Saving to YBT…" disabled={!isDirty}>
			Save to YBT
		</ActionButton>
	</div>
</form>
