import type { IridiumPubsubMessage } from '@satellite-im/iridium';
import type Iridium from '@satellite-im/iridium';

export type GameAnnouncement = {
	id: string;
	name: string;
	description: string;
	players: string[];
};

export class GameFinder {
	public lobby?: GameAnnouncement;
	public games: Record<string, GameAnnouncement> = {};
	constructor(public iridium: Iridium) {
		this.iridium = iridium;
	}

	async listen() {
		this.iridium.pubsub.subscribe('/game/announce', true);
		this.iridium.pubsub.on('/game/announce', (message: IridiumPubsubMessage<GameAnnouncement>) => {
			this.games[message.payload.id] = message.payload;
		});
	}

	create(name: string, description: string) {
		this.lobby = {
			id: this.iridium.id,
			name,
			description,
			players: []
		};
	}
}
