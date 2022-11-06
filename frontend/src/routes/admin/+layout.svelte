<script lang="ts">
  import defaultCardset from "$lib/tcg/data/alpha/cards.json"
	import { admin, getCardsCID, loadCardsFromFile, loadSavedCardset } from "$lib/stores/admin";
	import { onMount } from "svelte";
  let loading = false
  let cardsetFile: FileList | undefined = undefined
  let fileRef: HTMLInputElement

  onMount(async () => {
    await loadSavedCardset()

    if (!$admin.cards.length) {
      $admin.cards = defaultCardset
      $admin.cardsetId = await getCardsCID($admin.cards)
    }
  })

  async function onLoadCardset() {
    if (!cardsetFile?.[0]) return
    loading = true
    await loadCardsFromFile(cardsetFile?.[0])
    loading = false
  }

  function reset() {
    $admin.cardsetId = undefined
    $admin.cards = []
    cardsetFile = undefined
  }

  async function save() {
    // prompt the user to download the cardset as a JSON file
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify($admin.cards)], {type: "text/json"});
    const newCardsetId = await getCardsCID($admin.cards)
    a.href = URL.createObjectURL(file);
    a.download = `${newCardsetId}.json`;
    a.click();
  }
</script>
<header>
  <h1>cryptids.xyz</h1>
  <section class="flex gap-4 items-center justify-center">
    <h4>Cardset</h4>
    {#if $admin.cardsetId}
      {$admin.cardsetId.substring(0, 4)}...{$admin.cardsetId.substring($admin.cardsetId.length - 8)}
      <button on:click={reset}>
        <div class="i-tabler-x"></div>
      </button>
      <button on:click={save}>
        <div class="i-tabler-download"></div>
      </button>
    {:else if loading}
      <div class="flex items-center justify-center">
        <div class="i-tabler-loader animate-spin"></div>
        <p>Loading...</p>
      </div>
    {:else}
      <form on:submit|preventDefault={onLoadCardset}>
        <input type="file" bind:files={cardsetFile} class="hidden" bind:this={fileRef} on:change={onLoadCardset} />
        <button on:click={() => fileRef.click()}>
          <div class="i-tabler-upload"></div>
          Upload Cardset
        </button>
      </form>
    {/if}
  </section>
  <nav>
    <a href="/admin/cards">Cards</a>
    <a href="/admin/decks">Decks</a>
    <a href="/admin/players">Players</a>
    <a href="/game">Game</a>
    <a href="/">Home</a>
  </nav>
</header>
<main>
  <slot />
</main>

<style>
  header {
    @apply flex justify-between items-centerbox-border overflow-hidden p-2;
  }
  header h1 {
    @apply text-3xl font-bold;
  }
  nav {
    @apply flex flex-row gap-4 px-4 py-2;
  }
  main {
    @apply p-2;
  }
  button {
    @apply flex items-center justify-center px-2 py-1 rounded bg-neutral-700 gap-2;
  }
</style>