import type { Deck } from '../deck/types';
import type { GamePlayer } from '../game/types';

export function createPlayer(
	partial: Partial<GamePlayer> & { id: string; name: string; deck: Deck['id'] }
): GamePlayer {
	return {
		avatar: '',
		host: true,
		ready: false,
		connected: false,
		score: 20,
		hand: [],
		discard: [],
		exile: [],
		active: [],
		...partial
	};
}
