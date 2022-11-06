import type { Card } from '../cards/Card';

export class Deck {
	constructor(public id: string, public name: string, public cards: Card[]) {}
	shuffle(randomSeed: Uint8Array) {
		this.cards = this.cards.sort(() => {
			const [a, b] = randomSeed;
			return a - b;
		});
	}

	draw(count = 1) {
		const cards = this.cards.splice(0, count);
		return cards;
	}

	add(card: Card) {
		this.cards.push(card);
	}

	remove(card: Card) {
		this.cards = this.cards.filter((c) => c.id !== card.id);
	}

	get length() {
		return this.cards.length;
	}
}
