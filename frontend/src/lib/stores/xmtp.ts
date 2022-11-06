import { Client as XMTPClient } from '@xmtp/xmtp-js';
import type { Signer } from 'ethers';
import { writable } from 'svelte/store';

export const xmtp = writable<XMTPClient | null>(null);
export async function createXMTP(signer: Signer) {
	return XMTPClient.create(signer, {})
		.then((_xmtp) => {
			console.info('XMTP client created', _xmtp);
			xmtp.update(() => _xmtp);
			return _xmtp;
		})
		.catch((error) => {
			console.error('XMTP client creation failed', error);
			return null;
		});
}
