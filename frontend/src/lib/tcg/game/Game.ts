import type { Iridium, IridiumIPFSPeer, IridiumMessage } from '@satellite-im/iridium';
import type { Player } from '../player/types';
import type {
	GameMode,
	GamePlayer,
	GamePlayers,
	GameSeason,
	GameStatus,
	WinCondition
} from './types';
import Emittery from 'emittery';

export type GameEvents = {
	'player:connect': GamePlayer;
	'player:disconnect': GamePlayer;
	'player:ready': GamePlayer;
	'player:unready': GamePlayer;
};

export class Game {
	private randomSeed: Uint8Array = new Uint8Array(2);
	public emitter: Emittery<GameEvents>;
	public mode: GameMode = 'default';
	public season: GameSeason = 'alpha';
	public status: GameStatus = 'lobby';
	public winCondition: WinCondition = 'default';
	public turn = 0;
	public phase = 0;

	constructor(public iridium: Iridium, public players: GamePlayers<Player[]>) {
		this.emitter = new Emittery();
		this.bindEventListeners();
	}

	bindEventListeners() {
		this.iridium.p2p.on('/peer/connect', (peer: IridiumIPFSPeer) => {
			if (peer.did === this.iridium.id) return;
			const player = this.players[peer.did];
			if (!player) return;
			player.connected = true;
			this.emitter.emit('player:connect', player);
		});

		this.iridium.p2p.on('/peer/message/game/ready', (message: IridiumMessage) => {
			const player = this.players[message.from.toString()];
			if (!player) return;
			player.ready = true;
			this.emitter.emit('player:ready', player);
		});

		this.iridium.p2p.on('/peer/message/game/unready', (message: IridiumMessage) => {
			const player = this.players[message.from.toString()];
			if (!player) return;
			player.ready = false;
			this.emitter.emit('player:unready', player);
		});

		this.iridium.p2p.on('/peer/disconnect', (peer: IridiumIPFSPeer) => {
			if (peer.did === this.iridium.id) return;
			const player = this.players[peer.did];
			if (!player) return;
			player.connected = false;
			this.emitter.emit('player:disconnect', player);
		});
	}

	setRandomSeed(seed: Uint8Array) {
		this.randomSeed = seed;
	}
}
