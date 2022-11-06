<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/stores/game';
  import { account } from '$lib/stores/wallet'
  import { xmtp } from '$lib/stores/xmtp'
	import { goto } from '$app/navigation';
	import { getPlayers, isRegistered, loadContract } from '$lib/stores/registry';

	let modal: false | 'create' | 'search' = false;

	const filters = {
		name: '',
		player: '',
		type: 'default'
	};

	onMount(async () => {
		if (!$xmtp || !$account?.isConnected) {
			goto('/game');
		}

		await loadContract()

		const registered = await isRegistered()
		console.info('registered', registered)
		const players = await getPlayers()
		console.info('players', players)
	});

	function onFormSubmit() {}

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
</script>

<svelte:window on:keydown={onModalKeypress} />

{#if modal}
	<div id="lobbies_modal" class="modal__container">
		<div class="modal__inner">
			<div class="modal__title">
				<h1>
					{#if modal === 'create'}create game{:else}find game{/if}
				</h1>
				<div class="modal__close" on:click={closeModal} on:keypress={onModalCloseKeypress}>
					<div class="i-tabler-x" />
				</div>
			</div>
			<div class="modal__content">
				{#if modal === 'create'}
					<form on:submit|preventDefault={onFormSubmit} class="form">
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
							<button type="submit">Search</button>
						</div>
					</form>
				{:else}
					<form on:submit|preventDefault={onFormSubmit} class="form">
						<div class="flex flex-col gap-2 w-full">
							<div class="field">
								<label for="name" class="label">Name</label>
								<input id="name" class="input" type="text" bind:value={filters.name} />
							</div>
							<div class="field">
								<label for="player" class="label">Player</label>
								<input id="player" class="input" type="text" bind:value={filters.player} />
							</div>
							<div class="field">
								<label for="type" class="label">Type</label>
								<select id="type" class="select" bind:value={filters.type}>
									<option value="default">Default</option>
									<option value="custom">Custom</option>
								</select>
							</div>
							<button type="submit">Search</button>
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
		</div>
		<div class="lobbies__players">
      <h2>friends</h2>
			<p>no peers yet</p>
    </div>
	</div>
	<div class="buttons">
		<button on:click={() => (modal = 'search')}>find game</button>
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
	button[type='submit'] {
		@apply bg-indigo-500 border-indigo-400 px-4 py-2 rounded;
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
</style>
