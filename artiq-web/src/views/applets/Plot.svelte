<script module lang="ts">
  import type { Layout } from "plotly.js-dist-min";

  export const defaultLayout = {
    margin: { l: 0, r: 0, t: 0, b: 0 },
    xaxis: { automargin: true },
    yaxis: { automargin: true },
    showlegend: false,
  } satisfies Partial<Layout>;
</script>

<script lang="ts">
  import Plotly from "plotly.js-dist-min";
  import type { Data } from "plotly.js-dist-min";
  import { onMount } from "svelte";

  let {
    traces,
    layout = defaultLayout,
  }: {
    traces: Data[];
    layout?: Partial<Layout>;
  } = $props();

  let root: HTMLDivElement;

  const config = {
    displayModeBar: false,
    responsive: true,
  };

  $effect(() => {
    Plotly.react(root, traces, layout, config);
  });

  onMount(() => {
    const observer = new window.ResizeObserver(() => Plotly.Plots.resize(root));

    observer.observe(root);

    return () => {
      observer.disconnect();
      Plotly.purge(root);
    };
  });
</script>

<div bind:this={root}></div>

<style>
  div {
    height: 100%;
  }
</style>
