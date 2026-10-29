<script module lang="ts">
  import type { Layout, PlotlyHTMLElement } from "plotly.js-dist-min";

  export const defaultLayout = {
    margin: { l: 0, r: 0, t: 0, b: 0 },
    xaxis: { automargin: true },
    yaxis: { automargin: true },
    showlegend: false,
    uirevision: "keep",
  } satisfies Partial<Layout>;
</script>

<script lang="ts">
  import Plotly from "plotly.js-dist-min";
  import type { Data, PlotMouseEvent } from "plotly.js-dist-min";
  import { onMount } from "svelte";

  let {
    traces,
    layout = defaultLayout,
    onhover,
  }: {
    traces: Data[];
    layout?: Partial<Layout>;
    onhover?: (ev: PlotMouseEvent, el: PlotlyHTMLElement) => void;
  } = $props();

  let root: HTMLDivElement;
  let ready = $state(false);

  const config = {
    displayModeBar: false,
    showTips: false,
  };

  $effect(() => {
    if (!ready) return;
    Plotly.react(root, traces, window.structuredClone(layout));
  });

  onMount(() => {
    let active = true;

    const observer = new window.ResizeObserver(() =>
      Plotly.relayout(root, { autosize: true }),
    );

    Plotly.newPlot(root, [], window.structuredClone(layout), config).then(
      (el) => {
        if (!active) return;

        el.on("plotly_hover", (ev) => onhover?.(ev, el));
        ready = true;
        observer.observe(root);
      },
    );

    return () => {
      active = false;
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
