import type { CardState } from '../cards/types';
import type { Deck } from '../deck/types';
import type { Player } from '../player/types';

export type GameMode = 'default';
export type GameSeason = 'experimental' | 'alpha' | 'beta' | 'prelaunch' | 'launch';
export type GameStatus =
	| 'lobby'
	| 'drafting'
	| 'banning'
	| 'waiting'
	| 'playing'
	| 'finished'
	| 'canceled';

export type GamePlayer = Player & {
	host: boolean;
	ready: boolean;
	connected: boolean;
	score: number;
	deck: Deck['id'];
	hand: Deck['cards'][number]['id'][];
	discard: Deck['cards'][number]['id'][];
	exile: Deck['cards'][number]['id'][];
	active: CardState[];
};

export type GamePlayers<Players extends Player[] = Player[]> = {
	[ID in Players[number]['id'] as string]: GamePlayer;
};

export type WinCondition = 'default' | 'custom';

export type Game<Players extends Player[] = Player[]> = {
	id: string;
	mode: GameMode;
	season: GameSeason;
	status: GameStatus;
	players: GamePlayers<Players>;
	win_condition: WinCondition;
	invited?: boolean;
	joined?: boolean;
	turn: number;
	phase: number;
	updated_at: number;
	created_at: number;
};
