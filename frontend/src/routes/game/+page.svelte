<script lang="ts">
	import { setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { account, signer } from '$lib/stores/wallet';
	import { createXMTP, xmtp } from '$lib/stores/xmtp';

	setContext('xmtp', xmtp);
	$: if ($xmtp.client && $account?.isConnected) {
		goto('/game/dashboard');
	}
</script>

{#if !$account?.isConnected}
	<div class="flex flex-col gap-4 w-full h-full items-center justify-center">
		<h1>Connect</h1>
		<p>Connect a wallet using the button at the top right of your screen to get started.</p>
	</div>
{:else}
	<div class="flex flex-1 items-center justify-center">
		<div class="flex flex-row gap-4 items-center align-center">
			{#if !signer}
				<div class="text-left">
					<h2 class="flex items-center gap-2 animate-pulse">
						<div class="i-tabler-wallet" />
						Connecting to wallet signer...
					</h2>
					<p>
						If this process gets stuck, click the disconnect button in the top right corner and try
						again.
					</p>
				</div>
			{:else if !$xmtp.client}
				<div class="text-left">
					<h2 class="flex items-center gap-2 animate-pulse">
						<div class="i-tabler-plug" />
						Connecting to XMTP...
					</h2>
					{#if $signer}
						{#await createXMTP($signer)}
							<p class="text-yellow-200">check for a signing request in your wallet</p>
							<p class="text-(xs neutral-500)">
								If you get stuck, click the disconnect button in the top right corner.
							</p>
						{:then}
							<p>xmtp detected</p>
						{/await}
					{:else}
						<p>signer not yet detected...</p>
					{/if}
				</div>
			{:else}
				<div class="text-center">Connecting...</div>
			{/if}
		</div>
	</div>
{/if}
