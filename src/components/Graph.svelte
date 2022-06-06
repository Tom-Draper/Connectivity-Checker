<script>
  import { onMount } from "svelte";
  export let data;

  onMount(() => {
    console.log(data);
    let plotDiv = document.getElementById("plotDiv");
    let Plot = new Plotly.newPlot(
      plotDiv,
      [data],
      {},
      { showSendToCloud: false }
    );
  });
</script>

<div id="plotly">
  <div id="plotDiv"><!-- Plotly chart will be drawn inside this DIV --></div>
</div>
