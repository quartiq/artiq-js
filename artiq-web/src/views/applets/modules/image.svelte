<script lang="ts">
  import type { Data, Layout } from "plotly.js-dist-min";
  import type { NpArray } from "sipyco-js/pyon";

  import Plot, { defaultLayout } from "../Plot.svelte";
  import { reshape2d } from "../plotlyutils";

  import type { Keypath } from "artiq-js/datasets";
  import { parse, resolve } from "../argparse";
  import type { Schema } from "../argparse";

  type Args = {
    img: Keypath;
  };

  type Datasets = {
    img: NpArray;
  };

  let { argv }: { argv: string[] } = $props();

  const schema = {
    positionals: ["img"],
  } satisfies Schema<Args>;

  const args = $derived(parse<Args>(argv, schema));
  const data = $derived(resolve<Datasets>(args, ["img"]));

  const traces = $derived.by((): Data[] => {
    if (!data.img) return [];

    return [
      {
        type: "heatmap",
        z: reshape2d(data.img[1]),
        transpose: true,
        colorscale: "Greys",
        colorbar: { ypad: 0 },
      },
    ];
  });

  const layout = {
    ...defaultLayout,
    yaxis: { autorange: "reversed" },
  } satisfies Partial<Layout>;
</script>

<Plot {traces} {layout} />
