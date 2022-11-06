import { Contract } from 'ethers';
import { writable } from 'svelte/store';
import { signer } from '../wallet';
import { abi } from './contract.json';
export const PLAYER_REGISTRY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const PLAYER_REGISTRY_ABI = abi;

export const registry = writable<Contract | null>(null);

export function loadContract() {
	return new Promise((resolve, reject) => {
		signer.update((_signer) => {
			if (_signer) {
				const _contract = new Contract(PLAYER_REGISTRY_ADDRESS, PLAYER_REGISTRY_ABI, _signer);
				registry.update(() => _contract);
				resolve(_contract);
			}
			reject();
			return _signer;
		});
	});
}

export type ContractPlayer = {
	name: string;
	games: string[];
};

export function getPlayers() {
	return new Promise((resolve, reject) => {
		registry.update((_registry) => {
			if (_registry) {
				console.info('registry contract present, getting players', _registry);
				_registry
					.getPlayers(0, 100)
					.then((players: ContractPlayer[]) => {
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

export function isRegistered() {
	return new Promise((resolve, reject) => {
		registry.update((_registry) => {
			if (_registry) {
				console.info('registry contract present, getting players', _registry);
				_registry
					.isRegistered()
					.then((result: boolean) => {
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
