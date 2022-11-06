import { Client as XMTPClient, type Conversation } from '@xmtp/xmtp-js';
import type { Signer } from 'ethers';
import { writable } from 'svelte/store';

export const xmtp = writable<{
	client: XMTPClient | null;
	conversations: { [key: string]: Conversation };
}>({ client: null, conversations: {} });
export async function createXMTP(signer: Signer) {
	return XMTPClient.create(signer, {})
		.then((_xmtp) => {
			console.info('XMTP client created', _xmtp);
			xmtp.update(() => ({ client: _xmtp, conversations: {} }));
			return _xmtp;
		})
		.catch((error) => {
			console.error('XMTP client creation failed', error);
			return null;
		});
}

export async function joinConversation(address: string) {
	return new Promise<Conversation | void>((resolve) => {
		xmtp.update((_xmtp) => {
			if (_xmtp.client) {
				console.info('Joining conversation', address);
				_xmtp.client.conversations
					.newConversation(address)
					.then((conversation) => {
						xmtp.update((__xmtp) => {
							console.info('Joined conversation', conversation);
							__xmtp.conversations[address] = conversation;
							resolve(conversation);
							return __xmtp;
						});
					})
					.catch((error) => {
						console.error('Failed to join conversation', error);
						resolve();
					});
			} else {
				console.info('no xmtp client, cannot join conversation');
			}
			return _xmtp;
		});
	});
}
