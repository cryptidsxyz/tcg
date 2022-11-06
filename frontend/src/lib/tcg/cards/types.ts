import type { GameMode, GameSeason } from '../game/types';

export type CardPlayability = {
	[Season in GameSeason as string]: {
		[Mode in GameMode as string]: boolean;
	};
};

export type CardAttributes = {
	[key: string]: unknown;
};

export type CardType = {
	id: string;
	name: string;
	description: string;
	subtypes: string[];
	added: number;
	updated: number;
};

export type CardTypes<Types extends CardType[] = [CardType]> = {
	[Key in Types[number]['id'] as string]: Types[number];
};

export type CardOperationParameters = {
	[Key: string]: unknown;
};

export type CardOperation<Parameters extends CardOperationParameters = CardOperationParameters> = {
	instruction: string;
	parameters: Parameters;
	target?: boolean;
	amount?: number;
	permanent?: boolean;
};

export type Card = {
	id: string;
	name: string;
	description: string;
	artwork_description?: string;
	artwork_image?: string;
	artwork_artist?: string;
	artwork_preview_cids?: string[];
	cid?: string;
	types?: string[];
	phases?: string[];
	operations?: CardOperation[];
	attributes?: { [attribute: string]: unknown };
	cost?: { [manaType: string]: number | undefined };
};

export type CardCounter = {
	attribute: string;
	amount: number;
};

export type CardState<T extends Card = Card> = {
	card: T;
	counters: CardCounter[];
};

export type CardCreatureAttributes = {
	attack: number;
	health: number;
};
export type CardManaParameters = { type: string; value: number }[];
export type CardMoveParameters = { amount: number; target: string };
