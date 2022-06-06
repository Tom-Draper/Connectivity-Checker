<script lang="ts">
  // import Switch from './components/Switch.svelte'
  import Graph from './components/Graph.svelte'

	let darkmode: string = "off";

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

  let x: number[] = [];
  let y: number[] = [];
  for (let i = 0; i < pings.length; i++) {
    if (pings[i][1] == null || pings[i][1] < 0) {
      y.push(0);
    } else {
      y.push(pings[i][1]);
    }
    x.push(i+1);
  }
  let data = {
    x: x,
    y: y,
    type: "bar"
  }

  let upCounts = 0;
  for (let i = 0; i < pings.length; i++) {
    if (pings[i][0] == 200) {
      upCounts += 1;
    }
  }
  let uptime = ((upCounts / pings.length) * 100).toFixed(1);

  let now = new Date(Date.now()).toUTCString();


  darkmode = "off";
  if (darkmode == "on") {
    document.documentElement.style.setProperty("--background", "#23272a");
    document.documentElement.style.setProperty("--card", "#1d2023");
    document.documentElement.style.setProperty("--text", "white");
  } else {
    document.documentElement.style.setProperty("--background", "white");
    document.documentElement.style.setProperty("--card", "white");
    document.documentElement.style.setProperty("--text", "black");
  }
</script>

<main>
  <div class="content">
    <!-- <div class="darkmode-toggle-container">
      <div class="darkmode-toggle">
        <Switch bind:value={darkmode} label="" design="slider" fontSize={12}/>
        {darkmode}
      </div>
    </div> -->
    <div class="header">
      <img class="big-tick" src="./img/bigtick.png" alt="" />
      <h2 class="status">All services are online</h2>
      <div class="last-updated">{now}</div>
    </div>
    <div class="pings-container">
      <h4 class="name">pldashboard.com</h4>
      <div class="uptime">
        <img class="tick" src="./img/tick.png" alt="" />
        <div class="uptime-text">
          Uptime: {uptime}%
        </div>
      </div>
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
      <div class="divider"></div>
      <Graph {data}></Graph>
    </div>
  </div>
</main>

<style type="scss">
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap");

  :root {
    --background: rgb(248, 248, 248);
    --card: white;
    --text: black;
  }
  
  :global(body) {
    background: var(--background);
    padding: 0;
    color: #1d2023;
  }

  main {
    text-align: center;
    max-width: 240px;
    margin: 0 auto;
    font-family: "Poppins";
    color: var(--text);
  }

  .content {
    width: fit-content;
    height: auto;
    margin: 0 auto;
    padding: 50px 0;
    .darkmode-toggle-container {
      position: absolute;
      top: 20px;
      right: 20px;
    }
    .header {
      padding: 100px 0 100px;
      .big-tick {
        width: 120px;
      }
      .last-updated {
        color: rgb(148, 148, 148);
      }
      .status {
        font-size: 2em;
        margin-bottom: 0.6rem;
      }
    }
    .pings-container {
      padding: 2.2rem 4rem;
      border-radius: 5px;
      background: var(--card);
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      .name {
        width: fit-content;
        margin: 0 0 1.5rem 0;
        font-size: 1em;
      }
      .uptime {
        width: fit-content;
        margin-bottom: 5px;
        font-size: 0.9em;
        display: flex;
        .tick {
          width: 20px;
          height: 20px;
          margin-right: 6px;
        }
      }
      .pings {
        display: flex;
        .ping {
          width: 4px;
          height: 50px;
          margin: 0 1px;
          border-radius: 3px;
        }
        .ok {
          background: rgb(76, 226, 76);
        }
        .failed {
          background: rgb(240, 69, 69);
          background: #FF6566;
        }
        .empty {
          background: rgb(229, 229, 229);
        }
      }
    }
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }



</style>