<script lang="ts">
  let pings: any = [
    [200, 354],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [404, -1],
    [404, -1],
    [404, -1],
    [404, -1],
    [404, -1],
    [404, -1],
    [404, -1],
    [200, 456],
    [200, 456],
    [404, -1],
    [404, -1],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
    [200, 456],
  ];

  let filler: null[][] = Array(150 - pings.length).fill([null, null]);
  pings = filler.concat(pings);

  console.log(pings);

  let upCounts =  0
  for (let i = 0; i < pings.length; i++) {
    if (pings[i][0] == 200) {
      upCounts += 1;
    }
  }
  let uptime = (upCounts / pings.length * 100).toFixed(1);


  let now = new Date(Date.now()).toUTCString();
</script>

<main>
  <div class="content">
    <div class="header">
      <img class="big-tick" src="./img/bigtick.png" alt="">
      <h2 class="status">All services are online</h2>
      <div class="last-updated">{now}</div>
    </div>
    <div class="pings-container">
      <h4 class="name">pldashboard.com</h4>
      <div class="uptime"><img class="tick" src="./img/tick.png" alt=""> <div class="uptime-text">
        Uptime: {uptime}%
      </div></div>
      <div class="pings">
        {#each pings as ping}
          {#if ping[0] == 200}
            <div class="ping ok" />
          {:else if ping[0] == 404}
            <div class="ping failed" />
          {:else}
            <div class="ping empty" />
          {/if}
        {/each}
      </div>
    </div>
  </div>
</main>

<style>
  :global(body) {
    background: rgb(248, 248, 248);
    padding: 0;
  }

  main {
    text-align: center;
    max-width: 240px;
    margin: 0 auto;
  }

  .big-tick {
    width: 120px;
  }
  .header {
    padding: 100px 0 100px;
  }
  .last-updated {
    color: rgb(148, 148, 148);
  }
  .status {
    font-size: 2em;
    margin-bottom: 0.6rem;
  }

  .content {
    width: fit-content;
    /* max-width: 900px; */
    height: auto;
    margin: 0 auto;
    padding: 50px 0;
  }
  .name {
    width: fit-content;
    margin: 0 0 1.8rem 0;
    font-size: 1.1em;
  }
  .uptime {
    width: fit-content;
    margin-bottom: 5px;
    display: flex;
  }
  .pings-container {
    padding: 2.2rem 4rem;
    border-radius: 5px;
    background: white;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    /* border: 2px rgb(229, 229, 229) solid; */
  }
  .pings {
    display: flex;
  }
  .ping {
    width: 4px;
    height: 50px;
    margin: 0 1px;
    border-radius: 3px;
  }
  .ok {
    background: rgb(60, 214, 60);
  }
  .failed {
    background: rgb(240, 69, 69);
  }
  .empty {
    background: rgb(229, 229, 229);
  }

  .tick {
    width: 22px;
    height: 22px;
    margin-right: 6px;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
