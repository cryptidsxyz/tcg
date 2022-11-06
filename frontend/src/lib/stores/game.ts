import type { GameMode, GameStatus } from '$lib/tcg/game/types';
import { writable } from 'svelte/store';
import { xmtp } from './xmtp';

export type GameAnnouncement = {
	name: string;
	type: GameMode;
	status: GameStatus;
	players: string[];
};

export const game = writable<{
	games: { [did: string]: GameAnnouncement };
}>({
	games: {}
});
