import { Contract } from 'ethers';
import { writable } from 'svelte/store';
import { signer } from '../wallet';
import { abi } from './contract.json';
export const PLAYER_REGISTRY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const PLAYER_REGISTRY_ABI = abi;

export const registry = writable<{
	contract?: Contract;
	registered: boolean;
	id?: string;
	name?: string;
	players: { [id: string]: ContractPlayer };
}>({ registered: false, players: {} });

export function loadRegistryContract() {
	return new Promise((resolve, reject) => {
		signer.update((_signer) => {
			if (_signer) {
				const _contract = new Contract(PLAYER_REGISTRY_ADDRESS, PLAYER_REGISTRY_ABI, _signer);
				registry.update((registry) => {
					registry.contract = _contract;
					return registry;
				});
				resolve(_contract);
			}
			reject();
			return _signer;
		});
	});
}

export type ContractPlayer = {
	id: string;
	name: string;
	owner: string;
	games: string[];
	connected?: boolean;
};

export async function loadRegistry() {
	await getId().catch(() => {
		/* do nothing */
	});
	await getName().catch(() => {
		/* do nothing */
	});
	await getPlayers().catch(() => {
		/* do nothing */
	});
}

export function getName() {
	return new Promise((resolve, reject) => {
		registry.update((_registry) => {
			if (_registry.contract) {
				const name = _registry.contract.getName();
				_registry.contract.getName().then((name: string) => {
					registry.update((__registry) => {
						__registry.name = name;
						return __registry;
					});
				});
				resolve(name);
			}
			reject();
			return _registry;
		});
	});
}

export function getPlayers() {
	return new Promise((resolve, reject) => {
		registry.update((_registry) => {
			if (_registry) {
				_registry.contract
					?.getPlayers(0, 1000)
					.then((_players: ContractPlayer[]) => {
						const players = _players
							.map((p) => ({
								id: p.id.toString(),
								name: p.name,
								owner: p.owner.toString(),
								games: p.games
							}))
							.filter((p) => p.name !== 'owner')
							.filter((p) => p.id.toString() !== _registry.id);
						registry.update((_registry) => ({
							..._registry,
							players: players.reduce(
								(acc, player) => ({
									...acc,
									[player.id]: player
								}),
								{}
							)
						}));
						resolve(players);
					})
					.catch((error: unknown) => {
						console.error(error);
						reject();
					});
			}
			return _registry;
		});
	});
}

export function getId() {
	return new Promise((resolve, reject) => {
		registry.update((_registry) => {
			if (_registry) {
				_registry.contract
					?.getId()
					.then((id: string) => {
						registry.update((__registry) => ({
							...__registry,
							id: id.toString(),
							registered: !!id
						}));
						resolve(id);
					})
					.catch((error: unknown) => {
						console.error(error);
						reject();
					});
			}
			return _registry;
		});
	});
}

export function isRegistered() {
	return new Promise((resolve, reject) => {
		registry.update((_registry) => {
			if (_registry) {
				_registry.contract
					?.isRegistered()
					.then((result: boolean) => {
						registry.update((_registry) => ({ ..._registry, registered: result }));
						resolve(result);
					})
					.catch((error: unknown) => {
						console.error(error);
						reject();
					});
			}
			return _registry;
		});
	});
}

export function registerUser(name: string) {
	return new Promise((resolve, reject) => {
		registry.update((_registry) => {
			if (_registry) {
				_registry.contract
					?.register(name)
					.then((id: string) => {
						registry.update((_registry) => ({
							..._registry,
							registered: true,
							id: id.toString(),
							name
						}));
						isRegistered();
						resolve(id.toString());
					})
					.catch((error: unknown) => {
						console.error(error);
						reject();
					});
			}
			return _registry;
		});
	});
}
