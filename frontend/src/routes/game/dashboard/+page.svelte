<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/stores/game';
	import { account } from '$lib/stores/wallet';
	import { joinConversation, xmtp } from '$lib/stores/xmtp';
	import { goto } from '$app/navigation';
	import {
		loadRegistry,
		loadRegistryContract,
		PLAYER_REGISTRY_ADDRESS,
		registerUser,
		registry
	} from '$lib/stores/registry';
	import type { Conversation, DecodedMessage } from '@xmtp/xmtp-js';

	let modal: false | 'create' | 'register' = false;
	let loading = false;

	let conversations: Record<string, Conversation> = {}
	let messages: Record<string, DecodedMessage[]> = {}
	let chatMessages: DecodedMessage[] = []

	const filters = {
		name: '',
		player: '',
		type: 'default'
	};

	onMount(async () => {
		if (!$xmtp.client || !$account?.isConnected) {
			goto('/game');
		}

		await loadRegistryContract();
		await loadRegistry();

		const messagePollingInterval = setInterval(() => {
			messagePolling()
		}, 5000)

		const conversationPollingInterval = setInterval(() => {
			conversationPolling()
		}, 10000)

		return () => {
			clearInterval(messagePollingInterval)
			clearInterval(conversationPollingInterval)
		}
	});

	async function conversationPolling() {
		if (!$xmtp.client) return
		for (const player of Object.values($registry.players)) {
			if (player.owner === $account?.address || conversations[player.id]) continue;
			console.info('joining conversation with', player);
			const conversation = await joinConversation(player.owner).catch(() => undefined)
			if (conversation) {
				conversations[player.id] = conversation;
				messages[player.id] = [];
				conversation.send(JSON.stringify({
					type: 'connect',
				}))
			}
		}
	}

	let lastPollTime = new Date()
	async function messagePolling() {
		if (!$xmtp.client) return
		console.info('polling for messages', conversations)
		for (const [playerId, conversation] of Object.entries(conversations)) {
			console.info('polling for messages from', playerId)
			const _messages = (await conversation.messages({
				startTime: lastPollTime
			}) || []).map(message => {
				message.content = JSON.parse(message.content)
				if (message.content.type === 'connect') {
					console.info('received connect message from', playerId)
					$registry.players[playerId].connected = true
				} 
				if (message.content.type === 'chat') {
					console.info('received chat message from', playerId)
					chatMessages.push(message)
				}
				return message
			})
			messages[playerId] = [ ...(messages[playerId] || []), ..._messages ]
		}
		lastPollTime = new Date()
	}

	function onCreateSubmit() {}

	let registerUsername = '';
	let registerError = '';
	async function onRegisterSubmit() {
		loading = true;
		await registerUser(registerUsername)
			.then(() => {
				modal = false;
			})
			.catch(() => {
				registerError = 'invalid username';
			});
		loading = false;
	}

	function closeModal() {
		modal = false;
	}

	function onModalCloseKeypress(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Space') {
			closeModal();
		}
	}

	function onModalKeypress(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeModal();
		}
	}

	let chatMessage = ''
	function sendChatMessage() {
		if (!chatMessage) return
		for (const conversation of Object.values(conversations)) {
			conversation.send(JSON.stringify({
				type: 'chat',
				text: chatMessage
			}))
		}
		chatMessage = ''
	}
</script>

<svelte:window on:keydown={onModalKeypress} />

{#if modal}
	<div id="lobbies_modal" class="modal__container">
		<div class="modal__inner">
			<div class="modal__title">
				<h1>
					{#if modal === 'create'}
						create game
					{:else if modal === 'register'}
						register
					{:else}
						find game
					{/if}
				</h1>
				<div class="modal__close" on:click={closeModal} on:keypress={onModalCloseKeypress}>
					<div class="i-tabler-x" />
				</div>
			</div>
			<div class="modal__content">
				{#if modal === 'create'}
					<form on:submit|preventDefault={onCreateSubmit} class="form">
						<div class="flex flex-col gap-2 w-full">
							<div class="field">
								<label for="name" class="label">Name</label>
								<input id="name" class="input" type="text" bind:value={filters.name} />
							</div>
							<div class="field">
								<label for="type" class="label">Type</label>
								<select id="type" class="select" bind:value={filters.type}>
									<option value="default">Default</option>
									<option value="custom">Custom</option>
								</select>
							</div>
							<div class="buttons">
								<button type="submit">Create Game</button>
							</div>
						</div>
					</form>
				{:else if modal === 'register'}
					<form on:submit|preventDefault={onRegisterSubmit} class="form">
						<div class="flex flex-col gap-2 w-full">
							<div class="field">
								<label for="name" class="label">Username</label>
								<input id="name" class="input" type="text" bind:value={registerUsername} />
							</div>
							<div class="buttons">
								{#if loading}
									<div class="flex items-center gap-2">
										<div class="i-tabler-loader animate-spin" />
										loading...
									</div>
								{:else}
									{#if registerError}
										<p class="text-red-300">
											<strong>error:</strong>
											{registerError}
										</p>
									{/if}
									<button type="submit">Register</button>
								{/if}
							</div>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</div>
{/if}

<div id="lobbies">
	<div class="flex w-full gap-4 h-full">
		<div class="lobbies__list">
			<h1>games</h1>
			{#if Object.keys($game.games).length}
				<p>Games found</p>
			{:else}
				<p>No games found!</p>
			{/if}
			<h3>Chat</h3>
			<div class="flex flex-col gap-2 px-4 py-2">
				{#each chatMessages as message}
					<div class="flex flex-col gap-2">
						<p>
							<strong>{message.senderAddress}</strong>
						</p>
						<pre class="text-gray-300">{message.content.text}</pre>
					</div>
				{/each}
			</div>
			<div class="flex flex-row gap-2">
				<form on:submit|preventDefault={sendChatMessage}>
					<input class="bg-neutral-700 px-2 py-1 rounded w-full border-neutral-600 border-2" type="text" bind:value={chatMessage} />
					<button class="bg-indigo-700 px-2 py-1 rounded border-indigo-600 border-2" type="submit">Send</button>
				</form>
			</div>
		</div>
		<div class="lobbies__players">
			<h2>players</h2>
			{#if $registry.registered}
				<div class="player player__self">
					<div class="player__status online" />
					<div class="player__name">
						<h3>{$registry.name}</h3>
						<span class="player__id">({$registry.id})</span>
					</div>
				</div>
			{:else}
				<p class="py-1 text-neutral-500">not registered!</p>
				{#if registerError}
					<p class="text-red-300">
						<strong>error:</strong>
						{registerError}
					</p>
				{/if}
				<div class="buttons mb-4">
					<button class="w-full" on:click={() => (modal = 'register')}>Register</button>
				</div>
			{/if}
			{#if Object.keys($registry.players).length}
				{#each Object.values($registry.players) as player}
					<div class="player">
						<div class="player__status" class:offline={!player.connected} class:online={player.connected} />
						<div class="player__name">
							<h3>{player.name}</h3>
							<span class="player__id">({player.id})</span>
						</div>
					</div>
				{/each}
			{:else}
				<p>No other players found!</p>
			{/if}
		</div>
	</div>
	<div class="buttons">
		<button on:click={() => (modal = 'create')}>create game</button>
	</div>
</div>

<style>
	.modal__container {
		@apply fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur;
	}
	.modal__inner {
		@apply bg-neutral-800 rounded-lg shadow-lg p-4 w-96;
	}
	.modal__title {
		@apply flex justify-between items-center;
	}
	.modal__close {
		@apply cursor-pointer text-2xl text-neutral-400 hover-(text-neutral-200);
	}
	#lobbies {
		@apply flex flex-col gap-8 items-start align-start w-full h-full px-8 py-4;
	}
	h1 {
		@apply mb-2;
	}
	.form {
		@apply flex w-full;
	}
	.field {
		@apply flex flex-col gap-2 items-start align-center w-full;
	}
	.field label {
		@apply text-neutral-400 w-full;
	}
	.field input,
	.field select {
		@apply flex-1 text-left bg-neutral-800 border-2 border-neutral-700 px-4 py-2 rounded w-full appearance-none;
	}
	.lobbies__list {
		@apply w-3/4 h-full;
	}
	.lobbies__players {
		@apply w-1/4 h-full;
	}
	.buttons {
		@apply flex gap-4 align-end justify-end w-full;
	}
	.buttons button {
		@apply bg-indigo-500 border-2 border-indigo-400 px-4 py-2 rounded;
	}
	.buttons button:last-child {
		@apply bg-teal-700 border-teal-600;
	}

	.player {
		@apply flex items-center gap-4 w-full rounded px-2 py-1 m-1;
	}

	.player__self {
		@apply bg-neutral-800;
	}

	.player__name {
		@apply flex gap-2 items-center justify-start;
	}

	.player__id {
		@apply text-neutral-400 text-sm;
	}

	.player__self .player__name h3 {
		@apply text-neutral-400;
	}

	.player__name h3 {
		@apply flex-1 text-yellow-100;
	}
	.player__status {
		@apply w-4 h-4 rounded-full;
	}
	.player__status.online {
		@apply bg-green-700;
	}
</style>
