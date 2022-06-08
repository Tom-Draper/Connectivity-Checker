<script lang="ts">
  import { onMount } from "svelte";
  import Graph from "./Graph.svelte";

  export let data: {
    live: boolean;
    name: string;
    uptime: string;
    pings: { loss: number; response: number; time: string }[];
  };

  let graphData: { x: number[]; y: number[]; type: string };
  function createGraphData(
    pings: { loss: number; response: number; time: string }[]
  ): { x: number[]; y: number[]; type: string } {
    let x = new Array(pings.length).fill(1).map((_, i) => i + 1);
    let y: number[] = [];
    for (let i = 0; i < pings.length; i++) {
      if (pings[i].loss == null || pings[i].response <= 0) {
        y.push(0);
      } else {
        y.push(pings[i].response / 1000000);
      }
    }
    let graphData = {
      x: x,
      y: y,
      type: "bar",
    };
    return graphData;
  }

  onMount(async function () {
    graphData = createGraphData(data.pings);
  });
</script>

<main>
  {#if data != undefined}
    <div class="pings-container">
      <h4 class="name">{data.name}</h4>
      <div class="uptime">
        {#if data.live}
          <img class="tick" src="./img/tick.png" alt="" />
        {/if}
        <div class="uptime-text">
          Uptime: {data.uptime}%
        </div>
      </div>
      <div class="pings">
        {#each data.pings as ping}
          {#if ping.response > 0}
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
        {#if graphData != undefined}
          <Graph {graphData} />
        {/if}
      </div>
    </div>
  {/if}
</main>

<style lang="scss">
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
</style>
