<script lang="ts">
	import { writable } from 'svelte/store';
	import { account, disconnect, ens } from '$lib/stores/wallet';
	import { goto } from '$app/navigation';

	export const ui = writable({
		loading: false,
		error: null,
		titlebar: {
			toggled: false
		},
		sidebar: {
			toggled: false
		},
		taskbar: {
			toggled: false
		}
	});

	export function uiToggle(key: 'titlebar' | 'sidebar' | 'taskbar', value: boolean | null = null) {
		$ui[key].toggled = value === null ? !$ui[key].toggled : value;
	}

	export function uiKeypressHandler(section: 'titlebar' | 'sidebar' | 'taskbar') {
		return function (event: KeyboardEvent) {
			if (document.activeElement !== event.target) return;
			if (event.key === 'Escape') {
				uiToggle(section, false);
			} else if (event.key === 'Enter') {
				uiToggle(section, true);
			} else if (event.key === 'Tab') {
				uiToggle(section, false);
			}
		};
	}

	export function uiClickHandler(section: 'titlebar' | 'sidebar' | 'taskbar') {
		return function (event: MouseEvent) {
			if (event.target === event.target) {
				uiToggle(section);
			}
		};
	}

	$: if ($account?.isConnected) {
		goto('/game');
	}
</script>

<main id="game">
	<section id="titlebar">
		<div
			id="brand"
			on:click={uiClickHandler('titlebar')}
			on:keypress={uiKeypressHandler('titlebar')}
		>
			<div
				id="brand-icon"
				class={!$ui.titlebar.toggled ? 'animate-[pulse_5s_ease-in-out_infinite]' : ''}
			>
				<div class="i-tabler-ghost" />
			</div>
			<h1>cryptids.xyz</h1>
		</div>

		{#if $account?.isConnected}
			<div id="wallet">
				{#if $ens.name}
					<div class="ens__container">
						<div class="ens__avatar">
							{#if $ens.avatar}
								<img src={$ens.avatar} alt="my avatar" />
							{/if}
						</div>
						<div class="ens__username">
							{$ens.name}
						</div>
					</div>
				{:else}
					<div class="wallet__address">
						0x{$account?.address?.substring(0,6)}...{$account?.address?.substring($account?.address?.length - 6)}
					</div>
				{/if}
				<button class="wallet__disconnect" on:click={disconnect}>
					<div class="i-tabler-plug-connected-x"></div>
				</button>
			</div>
		{:else}
			<w3m-connect-button />
		{/if}
	</section>
	<div id="primary">
		<section id="sidebar" class:collapsed={!$ui.taskbar.toggled} />
		<section id="primary__container">
			<slot />
		</section>
		<w3m-modal />
	</div>
	<section id="taskbar" class:collapsed={!$ui.taskbar.toggled} />
</main>

<style>
	#game {
		@apply flex flex-col h-full w-full bg-gradient-to-b from-neutral-900/50 to-neutral-800/50 box-border overflow-hidden;
	}
	#titlebar {
		@apply flex flex-row justify-between items-center;
		@apply h-16 w-full px-4 py-1 shadow-md box-border;
		@apply bg-gradient-to-t from-neutral-900 to-neutral-800;
		@apply border-(b-2 neutral-800);
		@apply transition-all duration-500;
	}
	#brand {
		@apply flex flex-row items-center justify-center gap-2 text-xl select-none cursor-pointer;
	}
	#brand:hover h1 {
		@apply text-cyan-200;
	}
	#brand-icon {
		@apply text-3xl text-yellow-200 transition-all duration-500;
	}
	#brand h1 {
		@apply text-2xl text-cyan-100 text-shadow-md transition-all duration-500;
	}
	#titlebar.collapsed #brand h1 {
		@apply text-lg;
	}
	#primary {
		@apply flex flex-row h-full w-full;
	}
	#sidebar {
		@apply flex flex-col justify-between items-center h-full w-1/5 bg-neutral-800 border-r-2 border-neutral-900 box-border shadow-md;
	}
	#sidebar.collapsed {
		@apply w-0;
	}
	#primary__container {
		@apply flex flex-col justify-center items-center flex-1 m-4 bg-neutral-900 box-border rounded-md shadow-md border-2 border-neutral-800;
	}
	#taskbar {
		@apply flex flex-row justify-between items-center h-16 w-full bg-gradient-to-t from-neutral-800 to-neutral-900 border-t-2 border-neutral-800 box-border shadow-md;
	}
	#taskbar.collapsed {
		@apply h-0;
	}
	#wallet {
		@apply flex flex-row items-center justify-center gap-2;
	}
	.wallet__address {
		@apply text-sm text-neutral-100;
	}
	.wallet__disconnect {
		@apply text-sm text-neutral-300 bg-neutral-700 rounded-full flex items-center justify-center shadow-md w-6 h-6;
	}
</style>
