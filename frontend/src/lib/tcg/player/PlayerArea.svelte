  <script lang="ts">
    export const player: Player;
  </script>
  
  <div class="player__area">
        <div class="player__staging">
          <div class="player__deck">
            <div class="cardstack"></div>
          </div>
          <div class="player__hand">
            {#each player.hand as card, i}
            <div class="card"></div>
            {/each}
          </div>
        </div>
        <div class="player__field">
          <div class="card"></div>
          <div class="card"></div>
          <div class="card"></div>
          <div class="card"></div>
          <div class="card"></div>
          <div class="card"></div>
          <div class="card"></div>
        </div>
      </div>