<script>
  import { onMount } from "svelte";
  export let data;

  onMount(() => {
    console.log(data);
    let plotDiv = document.getElementById("plotDiv");
    let Plot = new Plotly.newPlot(
      plotDiv,
      [data],
      {
        title: false,
        height: 200,
        margin: { r: 50, l: 0, t: 20, b: 20, pad: 5 },
        colorway: ['#c9c9c9'],
        yaxis: { side: "right", ticksuffix: "ms", color: "#949494" },
        xaxis: { color: "white" }
      },
      { showSendToCloud: false, staticPlot: true }
    );
  });
</script>

<div id="plotly">
  <div id="plotDiv"><!-- Plotly chart will be drawn inside this DIV --></div>
</div>
