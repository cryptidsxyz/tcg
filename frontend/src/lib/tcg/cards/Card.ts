import type { CardAttributes, CardOperation } from './types';

export class Card<Attributes extends CardAttributes = CardAttributes> {
	constructor(
		public id: string,
		public name: string,
		public description: string,
		public types: string[],
		public manaCost: number,
		public attributes: Attributes,
		public operations: CardOperation[]
	) {}
}
