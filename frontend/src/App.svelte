<script lang="ts">
  import { onMount } from "svelte";
  import Card from "./components/Card.svelte";

  function allServicesOnline() {
    if (data == undefined) {
      return false;
    }
    for (let i = 0; i < data.data.length; i++) {
      let pings = data.data[i].pings
      if (pings[pings.length - 1].response <= 0) {
        return false;
      }
    }
    return true;
  }

  function calcUptime(
    pings: {
      loss: number | null;
      response: number | null;
      time: string | null;
    }[]
  ) {
    let upCounts = 0;
    for (let i = 0; i < pings.length; i++) {
      if (pings[i].response > 0) {
        upCounts += 1;
      }
    }
    let uptime = ((upCounts / pings.length) * 100).toFixed(1);
    return uptime;
  }

  function changeFavicon() {
    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = "/img/faviconcross.png";
  }

  async function fetchData(address: string) {
    const response = await fetch(address);
    let json = await response.json();

    // Insert computed values for each website
    return json;
  }

  function formatData(json: {
    time: string;
    data: {
      name: string;
      pings: {
        loss: number | null;
        response: number | null;
        time: string | null;
      }[];
    }[];
  }): typeof data {
    for (let i = 0; i < json.data.length; i++) {
      let pings = json.data[i].pings;
      json.data[i].uptime = calcUptime(pings);
      json.data[i].live = pings[pings.length - 1].response > 0;
      if (pings.length > 144) {
        pings = pings.slice(pings.length-144);
      }
      let filler: null[][] = Array(144 - pings.length).fill({
        loss: null,
        response: null,
        time: null,
      });
      json.data[i].pings = filler.concat(pings); // Pad with null values to 150 vals
    }
    json.time = new Date(json.time).toLocaleDateString('en-GB', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', hour12: false, minute:'2-digit', second:'2-digit'});
    return json;
  }

  let data:
    | {
        time: Date;
        data:
          | {
              name: string;
              pings: {
                loss: number | null;
                response: number | null;
                time: string | null;
              }[];
              live: boolean;
              uptime: string;
            }[];
      }
    | undefined = undefined;
  onMount(async function () {
    fetchData("https://connectivity-checker.herokuapp.com/data")
      .then((json) => {
        data = formatData(json);
      })
      .then(() => {
        if (!allServicesOnline()) {
          changeFavicon();
        }
      });
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
        {#if !allServicesOnline()}
          <img class="big-cross" src="./img/bigcross.png" alt="" />
          <h2 class="status">Services are down</h2>
        {:else}
          <img class="big-tick" src="./img/bigtick.png" alt="" />
          <h2 class="status">All services are online</h2>
        {/if}
        <div class="last-updated">{data.time}</div>
      </div>
      {#each data.data as _, i}
        <div class="card">
          <Card data={data.data[i]} />
        </div>
      {/each}
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
        font-size: 0.95em;
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
