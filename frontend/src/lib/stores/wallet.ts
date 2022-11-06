import {
	ClientCtrl,
	ConfigCtrl,
	AccountCtrl,
	EnsCtrl,
	ModalCtrl,
	SignerCtrl
} from '@web3modal/core';
import { chains, providers } from '@web3modal/ethereum';
import type { Signer } from 'ethers';
import type { AccountCtrlGetReturnValue } from '@web3modal/core';
import '@web3modal/ui';
import { writable } from 'svelte/store';
import { goto } from '$app/navigation';
import { xmtp } from './xmtp';

// Configure web3modal
ConfigCtrl.setConfig({
	projectId: '05d3030cfccb27ac6d7e267e3e2ea6fd',
	theme: 'dark',
	accentColor: 'default'
});

// Configure ethereum client
ClientCtrl.setEthereumClient({
	appName: 'cryptids.xyz',
	autoConnect: true,
	chains: [chains.mainnet],
	providers: [
		providers.walletConnectProvider({
			projectId: '05d3030cfccb27ac6d7e267e3e2ea6fd'
		})
	]
});

export function disconnect() {
	console.info('disconnecting');
	xmtp.update(() => null);
	signer.update(() => null);
	account.update(() => null);
	ens.update(() => ({}));
	AccountCtrl.disconnect();
	goto('/game');
}

export const account = writable<AccountCtrlGetReturnValue | null>(null);
ClientCtrl.subscribe((client) => {
	if (client.ethereum) {
		AccountCtrl.watch((update) => {
			if (update.isConnected && update.address) {
				console.info('Connected to Ethereum', update);
				SignerCtrl.fetch({
					chainId: chains.mainnet.id
				}).then((_signer) => {
					if (!_signer || !_signer._isSigner) {
						console.warn('No signer found');
						return _signer;
					}
					console.info('Signer found', _signer);

					signer.update(() => _signer);
					return _signer;
				});
			}
			account.update((state) => ({ ...state, ...update }));
		});
	}
});
export const ens = writable<{
	address?: string;
	avatar?: string;
	name?: string;
}>({});
export const signer = writable<Signer | null>(null);

account.subscribe((_account) => {
	ens.update((_ens) => {
		if (_account?.address && !_ens.avatar) {
			EnsCtrl.fetchEnsAvatar({ addressOrName: _account.address }).then((avatar) => {
				ens.update((state) => ({ ...state, avatar: avatar || undefined }));
			});
		}

		if (_account?.address && !_ens.name) {
			EnsCtrl.fetchEnsName({ address: _account.address }).then((name) => {
				ens.update((state) => ({ ...state, name: name || undefined }));
			});
		}
		return _ens;
	});

	return _account;
});

export function openModal() {
	ModalCtrl.open();
}

export function closeModal() {
	ModalCtrl.close();
}
