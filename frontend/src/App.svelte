<script lang="ts">
  import { onMount } from "svelte";
  import Graph from "./components/Graph.svelte";

  function createGraphData(pings: {loss: number, response: number, time: string}[]): {x: number[], y: number[], type: string} {
    let x = new Array(pings.length).fill(1).map( (_, i) => i+1);
    let y: number[] = [];
    for (let i = 0; i < pings.length; i++) {
      if (pings[i].loss == null || pings[i].response <= 0) {
        y.push(0);
      } else {
        y.push(pings[i].response/1000000);
      }
    }
    let graphData = {
      x: x,
      y: y,
      type: "bar",
    };
    return graphData
  }

  function calcUptime(pings: {loss: number, response: number}[]) {
    let upCounts = 0;
    for (let i = 0; i < pings.length; i++) {
      if (pings[i].response > 0) {
        upCounts += 1;
      }
    }
    let uptime = ((upCounts / pings.length) * 100).toFixed(1);
    return uptime;
  }

  let graphData: {x: number[], y: number[], type: string};
  let data: {live: boolean, name: string, time: Date, uptime: string, pings: {loss: number, response: number, time: string}[]};
  onMount(async function () {
    const response = await fetch("https://connectivity-checker.herokuapp.com/data/pldashboard.com");
    let json = await response.json();
    
    let pings = json.pings;

    console.log(pings);
    
    let uptime = calcUptime(pings);
    
    let filler: null[][] = Array(150 - pings.length).fill({
      loss: null,
      response: null,
      time: null
    });
    pings = filler.concat(pings);  // Pad with null values to 150 vals

    graphData = createGraphData(pings)
    
    data = {
      live: true,
      name: json.name,
      time: new Date(pings[pings.length-1].time),
      uptime: uptime,
      pings: pings,
    };

    console.log(data);

  });
  
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
    {#if data != undefined}
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
        <h4 class="name">{data.name}</h4>
      <div class="uptime">
        <img class="tick" src="./img/tick.png" alt="" />
        <div class="uptime-text">
          Uptime: {data.uptime}%
        </div>
      </div>
      <div class="pings">
        {#each data.pings as ping}
          {#if ping.response > 0 }
            <div class="ping ok" />
          {:else if ping.response == 0}
            <div class="ping failed" />
          {:else}
            <div class="ping empty" />
          {/if}
        {/each}
      </div>
      <div class="last-hours">Last 150 hours</div>
      <div class="ping-graph">
        <Graph {graphData} />
      </div>
    </div>
    {/if}
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
    .header {
      padding: 90px 0 90px;
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
          background: #ff6566;
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
