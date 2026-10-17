<script lang="ts">
	import ActionButton from './ActionButton.svelte';
	import PointRangeFields from './PointRangeFields.svelte';
	import type { BuildModel } from '$lib/board/buildQueue';
	import { buildModelLimits, draftOf, isSameDraft, saveYbtModel, validateYbtModel } from '$lib/board/saveYbtModel';
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

	async function save() {
		answer = '';
		problem = validateYbtModel(draft) ?? '';
		if (problem !== '') return;
		isSaving = true;
		answer = await saveYbtModel(model.modelId, draft).catch((failure: unknown) => ((problem = failureText(failure)), ''));
		await onsaved();
		isSaving = false;
	}
</script>

<div class="grid gap-3">
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
		<ActionButton kind="primary" isBusy={isSaving} busyText="Saving to YBT…" disabled={!isDirty} onclick={save}>
			Save to YBT
		</ActionButton>
	</div>
</div>
