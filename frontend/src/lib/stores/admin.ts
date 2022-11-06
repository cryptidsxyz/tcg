import { writable } from 'svelte/store';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2';
import type { Card } from '$lib/tcg/cards/types';

export const admin = writable<{
	cardsetId?: string;
	cards: Card[];
}>({
	cardsetId: undefined,
	cards: []
});

export async function loadSavedCardset() {
	const { default: localforage } = await import('localforage');
	const cardsetId = await localforage.getItem<string>('cardsetId');
	if (cardsetId) {
		const cards = await localforage.getItem<Card[]>('cards');
		if (cards) {
			admin.update((admin) => ({
				...admin,
				cardsetId,
				cards
			}));
		}
	}

	admin.subscribe((_admin) => {
		localforage.setItem('cardsetId', _admin.cardsetId);
		localforage.setItem('cards', _admin.cards);
	});
}

export async function loadCardsFromFile(file: File) {
	const text = await file.text();
	const cards = JSON.parse(text) as Card[];
	const cid = await getCardsCID(cards);

	admin.update((admin) => {
		admin.cardsetId = cid.toString();
		admin.cards = cards;
		return admin;
	});
}

export async function getCardsCID(cards: Card[]) {
	const cardsEncoded = json.encode(cards);
	const hash = await sha256.digest(cardsEncoded);
	const cid = CID.create(1, json.code, hash);
	return cid.toString();
}
