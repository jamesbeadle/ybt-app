<script lang="ts">
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import { fadeEntrance } from '$lib/motion/entrances';
	import { invalidateAll } from '$app/navigation';
	import ActionButton from './ActionButton.svelte';
	import Panel from './Panel.svelte';
	import { saveSettings } from '$lib/desktopStore';
	import { settingsLabels, type DesktopSettings } from '$lib/settings/desktopSettings';
	import { addressLimits, originOf, validateSettings } from '$lib/settings/validateSettings';

	let { settings }: { settings: DesktopSettings } = $props();

	let draft = $state(untrack(() => ({ ...settings })));
	let problems = $state<string[]>([]);
	let isSaving = $state(false);
	let isSaved = $state(false);

	async function save(event: SubmitEvent) {
		event.preventDefault();
		problems = validateSettings(draft);
		if (problems.length > 0) return;
		isSaving = true;
		await saveSettings({ ybtOrigin: originOf(draft.ybtOrigin), lmStudioOrigin: originOf(draft.lmStudioOrigin) });
		await invalidateAll();
		isSaving = false;
		isSaved = true;
	}
</script>

<Panel title="Addresses">
	<form class="grid gap-4" onsubmit={save} oninput={() => (isSaved = false)}>
		{#each Object.entries(settingsLabels) as [field, label] (field)}
			<label class="grid gap-1.5">
				<span class="text-sm text-etch">{label}</span>
				<input
					class="field"
					type="url"
					required
					maxlength={addressLimits.longest}
					bind:value={draft[field as keyof DesktopSettings]}
				/>
			</label>
		{/each}
		{#each problems as problem (problem)}<p class="text-sm text-signal">{problem}</p>{/each}
		<div class="flex items-center gap-3">
			<ActionButton kind="primary" type="submit" isBusy={isSaving} busyText="Saving…">Save</ActionButton>
			{#if isSaved}<p class="text-sm text-go" transition:fade={fadeEntrance()}>Saved.</p>{/if}
		</div>
	</form>
</Panel>
