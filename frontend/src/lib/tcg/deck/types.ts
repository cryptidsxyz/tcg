import type { Card } from '../cards/types';

export type Deck = {
	id: string;
	name: string;
	owner: string;
	season: string;
	cards: Card[];
	public: boolean;
	created: number;
	updated: number;
};
