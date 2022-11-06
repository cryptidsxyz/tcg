import type { Card } from '../src/lib/tcg/cards/types';
import { determineCardValue } from '../src/lib/tcg/cards/util';
import cards from '../src/lib/tcg/data/example/cards.json';

(cards as Card[]).map((card: Card) => ({
	name: card.name,
	manaCost: determineCardValue(card)
})); // ?
