<script lang="ts">
	import { untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Panel from './Panel.svelte';
	import { saveSettings } from '$lib/desktopStore';
	import { settingsLabels, type DesktopSettings } from '$lib/settings/desktopSettings';
	import { addressLimits, originOf, validateSettings } from '$lib/settings/validateSettings';

	let { settings }: { settings: DesktopSettings } = $props();

	let draft = $state(untrack(() => ({ ...settings })));
	let problems = $state<string[]>([]);
	let isSaved = $state(false);

	async function save(event: SubmitEvent) {
		event.preventDefault();
		problems = validateSettings(draft);
		if (problems.length > 0) return;
		await saveSettings({ ybtOrigin: originOf(draft.ybtOrigin), lmStudioOrigin: originOf(draft.lmStudioOrigin) });
		await invalidateAll();
		isSaved = true;
	}
</script>

<Panel title="Addresses">
	<form class="grid gap-4" onsubmit={save}>
		{#each Object.entries(settingsLabels) as [field, label] (field)}
			<label class="grid gap-1">
				<span class="text-etch">{label}</span>
				<input
					class="rounded-lg border border-hairline bg-night px-3 py-2"
					type="url"
					required
					maxlength={addressLimits.longest}
					bind:value={draft[field as keyof DesktopSettings]}
				/>
			</label>
		{/each}
		{#each problems as problem (problem)}<p class="text-signal">{problem}</p>{/each}
		<button class="justify-self-start rounded-lg bg-signal px-3 py-1.5 font-medium">Save</button>
		{#if isSaved}<p class="text-go">Saved.</p>{/if}
	</form>
</Panel>
