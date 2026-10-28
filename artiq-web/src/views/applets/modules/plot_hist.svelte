<script lang="ts">
  import type { Data } from "plotly.js-dist-min";
  import type { TypedArray } from "sipyco-js/pyonutils";

  import Plot from "../Plot.svelte";
  import { toPlotArray } from "../plotlyutils";

  import type { Keypath } from "artiq-js/datasets";
  import { parse, resolve } from "../argparse";
  import type { Schema } from "../argparse";

  type Args = {
    y: Keypath;
    x?: Keypath;
  };

  type Datasets = {
    y: TypedArray;
    x: TypedArray;
  };

  let { argv }: { argv: string[] } = $props();

  const schema = {
    positionals: ["y"],
    options: {
      string: ["x"],
    },
  } satisfies Schema<Args>;

  const args = $derived(parse<Args>(argv, schema));
  const data = $derived(resolve<Datasets>(args, ["y", "x"]));

  const traces = $derived.by((): Data[] => {
    if (!data.y) return [];

    const y = [...toPlotArray(data.y[1]), 0];
    const x = data.x ? toPlotArray(data.x[1]) : y.map((_, i) => i);

    return [{ x, y, line: { shape: "hv" }, fill: "tozeroy" }];
  });
</script>

<Plot {traces} />
