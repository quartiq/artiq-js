<script module lang="ts">
  export const size = { w: 4, h: 5 };
</script>

<script lang="ts">
  import type { Keypath } from "artiq-js/datasets";
  import { parse, resolve } from "../argparse";
  import type { Schema } from "../argparse";

  type Args = {
    scalar: Keypath;
    "digit-count": number;
  };

  type Datasets = {
    scalar: number;
  };

  let { argv }: { argv: string[] } = $props();

  const schema = {
    positionals: ["scalar"],
    options: {
      default: { "digit-count": 10 },
    },
  } satisfies Schema<Args>;

  const args = $derived(parse<Args>(argv, schema));
  const data = $derived(resolve<Datasets>(args, ["scalar"]));

  const formatter = $derived(
    new Intl.NumberFormat("en-EN", {
      useGrouping: false,
      maximumSignificantDigits: args["digit-count"],
    }),
  );
</script>

<div class="number">
  {data.scalar ? formatter.format(data.scalar[1]) : "-"}
</div>

<style>
  .number {
    font-family: monospace;
    font-size: 72px;
  }
</style>
