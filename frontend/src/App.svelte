<script lang="ts">
  import { onMount } from "svelte";
  import Card from "./components/Card.svelte";

  function allServicesOnline() {
    for (let i = 0; i < data.length; i++) {
      if (data[i].response <= 0) {
        return false;
      } 
    }
    return true;
  }

  function calcUptime(pings: { loss: number; response: number }[]) {
    let upCounts = 0;
    for (let i = 0; i < pings.length; i++) {
      if (pings[i].response > 0) {
        upCounts += 1;
      }
    }
    let uptime = ((upCounts / pings.length) * 100).toFixed(1);
    return uptime;
  }

  $: data = [null, null, null, null];

  async function fetchPingData(address: string, index: number) {
    const response = await fetch(address);
    let json = await response.json();
  
    let pings = json.pings;
  
    console.log(pings);
    
    let uptime = calcUptime(pings);

    let live = pings[pings.length-1].response > 0;
  
    let filler: null[][] = Array(150 - pings.length).fill({
      loss: null,
      response: null,
      time: null,
    });
    pings = filler.concat(pings); // Pad with null values to 150 vals
    
    data[index] = {
      live: live,
      name: json.name,
      time: new Date(pings[pings.length - 1].time),
      uptime: uptime,
      pings: pings,
    };
    console.log(data);
  }
  
  onMount(async function () {
    fetchPingData("https://connectivity-checker.herokuapp.com/data/pldashboard.com", 0)
    fetchPingData("https://connectivity-checker.herokuapp.com/data/tomdraper.dev", 1)
    fetchPingData("https://connectivity-checker.herokuapp.com/data/notion-courses.netlify.app", 2)
    fetchPingData("https://connectivity-checker.herokuapp.com/data/colour-themes.netlify.app", 3)
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
    {#if !data.includes(null)}
      <div class="header">
        {#if !allServicesOnline()}
        <img class="big-cross" src="./img/cross.webp" alt="" />
        <h2 class="status">Service down</h2>
        {:else}
        <img class="big-tick" src="./img/bigtick.png" alt="" />
        <h2 class="status">All services are online</h2>
        {/if}
        <div class="last-updated">{data[3].time}</div>
      </div>
      <div class="card">
        <Card data={data[0]} />
      </div>
      <div class="card">
        <Card data={data[1]} />
      </div>
      <div class="card">
        <Card data={data[2]} />
      </div>
      <div class="card">
        <Card data={data[3]} />
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
    .card {
      margin-bottom: 3rem;
    }
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
