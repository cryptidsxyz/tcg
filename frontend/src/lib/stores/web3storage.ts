import { writable } from 'svelte/store';
import { Web3Storage } from 'web3.storage';

export const web3storage = writable<{
	client: Web3Storage | null;
}>({
	client: new Web3Storage({ token: import.meta.env.VITE_ENV_WEB3STORAGE_TOKEN })
});
