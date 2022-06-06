<script lang="ts">
  let pings: (number|null)[][] = [
    [200, 354],
    [200, 456],
    [404, -1],
    [null]
  ];
</script>

<main>
  <div class="content">
    <h2>Systems online</h2>
    <div class="pings">
      {#each pings as ping}
        {#if ping[0] == 200}
          <div class="ping ok"></div>
        {:else if ping[0] == 404}
          <div class="ping failed"></div>
        {:else}
          <div class="ping empty"></div>
        {/if}
      {/each}
    </div>
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  .content {
    width: 80%;
    max-width: 900px;
    height: auto;
    margin: 0 auto;
    
    border-radius: 5px;
    border: 2px rgb(201, 201, 201) solid;
  }
  .pings {
    padding: 50px;
    display: flex;
  }
  .ping {
    width: 4px;
    height: 50px;
    margin: 2px;
    border-radius: 3px;
  }
  .ok {
    background: rgb(60, 214, 60);
  }
  .failed {
    background: rgb(240, 69, 69);
  }
  .empty {
    background: rgb(198, 198, 198);
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
