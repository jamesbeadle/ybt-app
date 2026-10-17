<script lang="ts">
	import { page } from '$app/state';
	import { appSections, isSectionCurrent } from '$lib/navigation/appSections';

	const currentUrl = $derived(page.url);
	const restingClasses = 'text-etch hover:bg-ink/60 hover:text-chalk';
	const currentClasses = 'bg-ink text-chalk';
</script>

<nav class="flex items-center gap-1" aria-label="Sections">
	{#each appSections as section (section.href)}
		{@const isCurrent = isSectionCurrent(section, currentUrl.pathname)}
		<a
			class="rounded-lg px-3 py-1.5 text-sm font-medium no-underline transition-colors duration-150 {isCurrent ? currentClasses : restingClasses}"
			href={section.href}
			aria-current={isCurrent ? 'page' : undefined}
		>
			{section.label}
		</a>
	{/each}
</nav>
