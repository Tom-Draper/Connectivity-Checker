<script lang="ts">
  import Graph from './components/Graph.svelte'

  let pings: any = [] 
  for (let i = 0; i < 95; i++) {
    pings.push([200, Math.floor(Math.random() * 100)* Math.random() + Math.floor(Math.random() * 10)])
  }
  for (let i = 0; i < 5; i++) {
    pings.push([404, -1])
  }
  for (let i = 0; i < 50; i++) {
    pings.push([200, Math.floor(Math.random() * 100)* Math.random() + Math.floor(Math.random() * 10)])
  }
  let filler: null[][] = Array(150 - pings.length).fill([null, null]);
  pings = filler.concat(pings);

  let data = {
    live: true,
    time: new Date(Date.now()).toUTCString(),
    data: pings,
  }



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
  let graphData = {
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

  let darkmode = "off";
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
      {#if data.live}
        <img class="big-tick" src="./img/bigtick.png" alt="" />
        <h2 class="status">All services are online</h2>
      {:else}
        <img class="big-cross" src="./img/cross.webp" alt="" />
        <h2 class="status">Service down</h2>
      {/if}
      <div class="last-updated">{data.time}</div>
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
      <div class="last-hours">Last 150 hours</div>
      <div class="ping-graph">
        <Graph {graphData}></Graph>
      </div>
    </div>
  </div>
</main>

<style type="scss">
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap");

  :root {
    --background: rgb(248, 248, 248);
    --card: white;
    --secondary-text: #949494;
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
      padding: 80px 0 100px;
      .big-cross,
      .big-tick {
        width: 130px;
      }
      .last-updated {
        color: var(--secondary-text);
      }
      .status {
        font-size: 2em;
        margin-bottom: 0.6rem;
      }
    }
    .pings-container {
      padding: 2.4rem 5rem 2rem;
      border-radius: 5px;
      background: var(--card);
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      .name {
        width: fit-content;
        margin: 0 0 1.5rem 0;
        font-size: 1em;
      }
      .uptime {
        // width: fit-content;
        margin-bottom: 5px;
        font-size: 0.9em;
        display: flex;
        .tick {
          width: 20px;
          height: 20px;
          margin-right: 6px;
        }
      }
      .last-hours {
        // margin-left: auto;
        // flex-grow: 1;
        text-align: left;
        font-size: 0.8em;
        margin-top: auto;
        color: var(--secondary-text);
        margin: 4px 0 20px 0;
        
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
          background: #e5e5e5;
        }
      }
    }
    .ping-graph {
      margin-right: -50px;
    }
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }



</style>