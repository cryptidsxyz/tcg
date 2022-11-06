import type { CardState } from '../cards/types';

export class Player {
	constructor(
		public id: string,
		public name: string,
		public avatar: string,
		public host: boolean,
		public ready: boolean,
		public connected: boolean,
		public score: number,
		public deck: string,
		public hand: string[],
		public discard: string[],
		public exile: string[],
		public active: CardState[]
	) {}
}
