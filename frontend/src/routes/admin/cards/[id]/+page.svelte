<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Card } from '$lib/tcg/cards/types';
	import { writable } from 'svelte/store';
	import openai from '$lib/openai/store';
	import { admin } from '$lib/stores/admin';
	import { onMount } from 'svelte';

	const id = $page.params.id;
	const card = writable<Card | undefined>(undefined);

  $: $admin.cards = $admin.cards.map((c) => {
      if (c.id === $card?.id) {
          return $card;
      }
      return c;
  });

	onMount(() => {
		const _card = $admin.cards.find((card) => card.id === id) as Card;
		if (!_card) goto('/admin/cards');
		$card = _card;
	});

	let artworkLoading = false;
	let artworkPreviewImages: string[] = [];
	async function generateArtwork() {
		artworkLoading = true;
		const response = await openai.createImage({
			prompt: `artwork description: ${$card?.artwork_description}
character description: ${$card?.description}
style: graffiti, techno-digital, digital, surreal, vibrant colors`,
			n: 4,
			size: '1024x1024'
		});
		artworkPreviewImages = response.data.data.map((image) => image.url as string);
		artworkLoading = false;
	}

	async function selectArtwork(image: string) {
		if (!$card) return;
		$card.artwork_image = image;
		artworkPreviewImages = [];
	}
</script>

{#if $card}
	<h5>name</h5>
	<h1 contenteditable="true" bind:innerHTML={$card.name} />

	<h5>description</h5>
	<p contenteditable="true" bind:innerHTML={$card.description} />

	<h5>artwork description</h5>
	<p contenteditable="true" bind:innerHTML={$card.artwork_description} />

	<h5>artwork preview</h5>
	{#if artworkLoading}
		<div class="flex flex-gap-4 items-center">
			<div class="i-tabler-loader animate-spin" />
			<p>Generating artwork...</p>
		</div>
	{:else if artworkPreviewImages}
		<div class="flex flex-gap-4 items-center">
			{#each artworkPreviewImages as image}
				<div class="flex flex-col gap-2 rounded bg-neutral-800">
					<img src={image} alt="preview" style="width:512px;height:512px;" />
					<button class="button__select" on:click={() => selectArtwork(image)}>Select Artwork</button
					>
				</div>
			{/each}
		</div>
	{:else}
		<button on:click={generateArtwork}>Generate artwork</button>
	{/if}
	<button on:click={generateArtwork}>generate</button>
	{#if $card.artwork_image}
		<img src={$card.artwork_image} alt="card artwork" width="512" height="512" />
	{/if}
{/if}

<style>
	h5 {
		@apply text-md font-bold text-neutral-500;
	}
  .button__select {
    @apply bg-neutral-800 text-neutral-100 rounded px-2 py-1;
  }
</style>
