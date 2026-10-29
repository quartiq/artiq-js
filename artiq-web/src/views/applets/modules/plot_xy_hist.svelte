<script module lang="ts">
  export const size = { w: 6, h: 10 };
</script>

<script lang="ts">
  import type { Data } from "plotly.js-dist-min";
  import type { TypedArray } from "sipyco-js/pyonutils";
  import type { NpArray } from "sipyco-js/pyon";

  import Plotly from "plotly.js-dist-min";
  import Plot from "../Plot.svelte";
  import { reshape2d, toPlotArray } from "../plotlyutils";

  import type { Keypath } from "artiq-js/datasets";
  import { parse, resolve } from "../argparse";
  import type { Schema } from "../argparse";

  type Args = {
    x: Keypath;
    bounds: Keypath;
    counts: Keypath;
  };

  type Datasets = {
    x: TypedArray;
    bounds: TypedArray;
    counts: NpArray;
  };

  let { argv }: { argv: string[] } = $props();

  const schema = {
    positionals: ["x", "bounds", "counts"],
  } satisfies Schema<Args>;

  const args = $derived(parse<Args>(argv, schema));
  const data = $derived(resolve<Datasets>(args, ["x", "bounds", "counts"]));

  const means = $derived.by((): Data[] => {
    if (!data.x || !data.bounds || !data.counts) return [];

    const x = toPlotArray(data.x[1]);
    const bounds = toPlotArray(data.bounds[1]);
    const counts = reshape2d(data.counts[1]);

    const centers = bounds
      .slice(0, -1)
      .map((left, i) => (left + bounds[i + 1]) / 2);

    const y = counts.map((row) => {
      const total = row.reduce((sum, count) => sum + count, 0);
      const weighted = row.reduce(
        (sum, count, i) => sum + count * centers[i],
        0,
      );
      return weighted / total;
    });

    return [{ x, y, mode: "markers" }];
  });

  let selected = $state<number>();

  let hist = $derived.by((): Data[] => {
    if (selected === undefined || !data.bounds || !data.counts) return [];

    const x = toPlotArray(data.bounds[1]);
    const counts = reshape2d(data.counts[1])[selected];
    if (!counts) return [];

    const y = [...counts, 0];

    return [{ x, y, line: { shape: "hv", color: "#d62728" }, fill: "tozeroy" }];
  });
</script>

<div class="plots">
  <Plot
    traces={means}
    onhover={(ev, el) => {
      selected = ev.points[0].pointIndex;

      const colors = toPlotArray(data.x![1]).map((_, i) =>
        i === selected ? "#d62728" : "#1f77b4",
      );

      Plotly.restyle(el, { "marker.color": [colors] }, [0]);
    }}
  />

  <Plot traces={hist} />
</div>

<style>
  .plots {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: minmax(0, 1fr);
    height: 100%;
  }
</style>
