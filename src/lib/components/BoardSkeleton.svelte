<script lang="ts">
	const columnCount = 3;
	const cardCount = 2;
	const columns = Array.from({ length: columnCount }, (_, index) => index);
	const cards = Array.from({ length: cardCount }, (_, index) => index);
</script>

{#snippet placeholderCard()}
	<div class="rounded-lg bg-night p-3">
		<div class="mb-2 h-3 w-5/6 rounded bg-ink"></div>
		<div class="h-3 w-1/2 rounded bg-ink"></div>
	</div>
{/snippet}

<div class="grid gap-4 md:grid-cols-3" aria-busy="true" aria-label="Reading the build queue">
	{#each columns as column (column)}
		<section class="animate-pulse rounded-xl border border-hairline bg-carriage p-4">
			<div class="mb-4 h-4 w-2/3 rounded bg-ink"></div>
			<div class="grid gap-3">
				{#each cards as card (card)}{@render placeholderCard()}{/each}
			</div>
		</section>
	{/each}
</div>
