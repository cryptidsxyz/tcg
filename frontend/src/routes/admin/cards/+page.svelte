<script lang="ts">
	import { admin } from '$lib/stores/admin';
	import { determineCardValue } from '$lib/tcg/cards/util';
	import { writable } from 'svelte/store';

	const filters = writable({
		name: '',
		type: '',
		quality_min: 0,
		quality_max: 100
	});

	let filteredCards = $admin.cards;
	$: filteredCards = $admin.cards.filter((card) => {
		if ($filters.name && !card.name.toLowerCase().includes($filters.name.toLowerCase()))
			return false;
		if ($filters.type && !card.types?.find((type) => type.includes($filters.type.toLowerCase())))
			return false;
		if ($filters.quality_min && determineCardValue(card) < $filters.quality_min) return false;
		if ($filters.quality_max && determineCardValue(card) > $filters.quality_max) return false;
		return true;
	});
</script>

<h1>Cards Management</h1>
<section id="filters">
	<section class="filter">
		<label for="filter-name">Name</label>
		<input id="filter-name" type="text" bind:value={$filters.name} />
	</section>
	<section class="filter">
		<label for="filter-type">Type</label>
		<input id="filter-type" type="text" bind:value={$filters.type} />
	</section>
	<section class="filter">
		<label for="filter-rarity">Quality</label>
		<section id="filter-rarity">
			between
			<input id="filter-rarity" type="number" min="0" max="100" bind:value={$filters.quality_min} />
			and
			<input type="number" min="0" max="100" bind:value={$filters.quality_max} />
		</section>
	</section>
</section>
<table>
	<thead>
		<tr>
			<th>id</th>
			<th>name</th>
			<th>types</th>
			<th>quality</th>
			<th>attack</th>
			<th>health</th>
			<th>actions</th>
		</tr>
	</thead>
	<tbody>
		{#each filteredCards as card}
			<tr>
				<td>{card.id}</td>
				<td>{card.name}</td>
				<td>{card.types.join(',')}</td>
				<td>{determineCardValue(card)}</td>
				<td>{card.attributes?.attack || 0}</td>
				<td>{card.attributes?.health || 0}</td>
				<td>
					<div class="flex items-center justify-center gap-2">
						<a href="/admin/cards/{card.id}">edit</a>
					</div>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	h1 {
		@apply text-yellow-100 m-2;
	}
	table {
		@apply border-collapse border border-neutral-700 rounded h-full w-full overflow-hidden overflow-y-scroll;
	}
	tr {
		@apply border-b border-neutral-700 w-full;
	}
	th {
		@apply border border-neutral-700 bg-neutral-800 text-yellow-100 px-2 py-1;
	}
	td {
		@apply border border-neutral-700 text-neutral-100 px-2 py-1;
	}
	#filters {
		@apply flex flex-row gap-4 p-2;
	}
	.filter {
		@apply flex flex-col gap-1;
	}
	input,
	select {
		@apply bg-neutral-800 text-yellow-100 border border-neutral-700 rounded px-2 py-1;
	}
</style>
