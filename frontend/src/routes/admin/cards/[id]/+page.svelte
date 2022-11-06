<script lang="ts">
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { Buffer } from 'buffer';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Card } from '$lib/tcg/cards/types';
	import openai from '$lib/openai/store';
	import { admin } from '$lib/stores/admin';
	import { web3storage } from '$lib/stores/web3storage';

	const id = $page.params.id;
	const card = writable<Card | undefined>(undefined);
	let imageRef: HTMLImageElement;

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
	async function generateArtwork() {
		if (!$card) return;
		artworkLoading = true;
		const response = await openai.createImage({
			prompt: `card name: ${$card?.name}
artwork description: ${$card?.artwork_description}
card description: ${$card?.description}
style: graffiti, techno-digital, digital, surreal, vibrant colors, character`,
			n: 4,
			size: '1024x1024',
			response_format: 'b64_json'
		});
		// save the response in web3storage
		// create image files from the b64 data
		// add the image files to the card
		// save the card
		const files: File[] = response.data.data
			.map((data, i) => {
				if (!data.b64_json) return undefined;
				const buffer = Buffer.from(data.b64_json, 'base64');
				return new File([buffer], `artwork_preview_${i}.png`, { type: 'image/png' });
			})
			.filter((f) => f !== undefined) as File[];

		const previewCID = await $web3storage.client?.put(files);
		if (previewCID) {
			$card.artwork_preview_cids = [...($card.artwork_preview_cids || []), previewCID.toString()];
		}
		artworkLoading = false;
	}

	async function selectArtwork(image: string) {
		if (!$card) return;
		$card.artwork_image = image;
	}

	async function save() {
		if (!$web3storage.client) {
			console.warn('no web3storage client');
			return;
		}
		if (!$card?.artwork_image) {
			console.warn('no artwork image');
			return;
		}

		const request = await fetch($card.artwork_image);
		const blob = await request.blob();
		const imageFile = new File([blob], 'artwork.png', { type: 'image/png' });
		const jsonFile = new File([JSON.stringify($card)], 'card.json', { type: 'application/json' });
		$card.cid = await $web3storage.client.put([imageFile, jsonFile]);
	}

	export function cidPreviewImageURLs(cid: string) {
		return [
			`https://${cid}.ipfs.w3s.link/ipfs/${cid}/artwork_preview_0.png`,
			`https://${cid}.ipfs.w3s.link/ipfs/${cid}/artwork_preview_1.png`,
			`https://${cid}.ipfs.w3s.link/ipfs/${cid}/artwork_preview_2.png`,
			`https://${cid}.ipfs.w3s.link/ipfs/${cid}/artwork_preview_3.png`
		];
	}
</script>

{#if $card}
	<div class="flex gap-2">
		<section class="preview w-full">
			<h5>name</h5>
			<h1 contenteditable="true" bind:innerHTML={$card.name} />

			{#if $card.cid}
				<h5>cid</h5>
				<a
					href="https://{$card.cid}.ipfs.w3s.link"
					target="_blank"
					rel="noreferrer"
					class="text-2xl">{$card.cid}</a
				>
			{/if}

			<h5>description</h5>
			<p contenteditable="true" bind:innerHTML={$card.description} />

			<h5>artwork description</h5>
			<p contenteditable="true" bind:innerHTML={$card.artwork_description} />

			<h5>artwork preview</h5>
			{#if $card.cid}
				<img src="https://{$card.cid}.ipfs.w3s.link/ipfs/{$card.cid}/artwork.png" alt="artwork" />
			{/if}
			{#if $card.artwork_image}
				<img
					src={$card.artwork_image}
					alt="card artwork"
					width="256"
					height="256"
					bind:this={imageRef}
				/>
			{/if}
			<h5>artwork generation</h5>
			{#if artworkLoading}
				<div class="flex flex-gap-4 items-center">
					<div class="i-tabler-loader animate-spin" />
					<p>Generating artwork...</p>
				</div>
			{/if}
			{#if $card.artwork_preview_cids}
				{#each $card.artwork_preview_cids as cid}
					<h4>{cid}</h4>
					<div class="flex flex-gap-4 items-center">
						{#each cidPreviewImageURLs(cid) as image}
							<div class="flex flex-col gap-2 rounded bg-neutral-800">
								<img src={image} alt="preview" style="width:512px;height:512px;" />
								<button class="button__select" on:click={() => selectArtwork(image)}
									>Select Artwork</button
								>
							</div>
						{/each}
					</div>
				{/each}
			{:else}
				<button on:click={generateArtwork}>Generate artwork</button>
			{/if}
		</section>
		<section class="options flex flex-col gap-2">
			<button on:click={generateArtwork}>generate new artwork</button>
			<button on:click={save}>save this card to web3storage</button>
		</section>
	</div>
{/if}

<style>
	h5 {
		@apply text-md font-bold text-neutral-500;
	}
	.button__select {
		@apply bg-neutral-800 text-neutral-100 rounded px-2 py-1;
	}
	button {
		@apply bg-indigo-500 text-neutral-100 rounded px-2 py-1 m-2;
	}
</style>
