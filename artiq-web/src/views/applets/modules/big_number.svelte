<script lang="ts">
  import type { Keypath } from "artiq-js/datasets";
  import { resolve, parse } from "../argparse";
  import type { Schema } from "../argparse";

  type Args = {
    scalar: Keypath;
    "digit-count": number;
  };

  let { argv }: { argv: string[] } = $props();

  const schema = {
    positionals: ["scalar"],
    options: {
      default: { "digit-count": 10 },
    },
  } satisfies Schema<Args>;

  const args = $derived(parse<Args>(argv, schema));
  const data = $derived(resolve(args, ["scalar"]));

  const formatter = $derived(
    new Intl.NumberFormat("en-EN", {
      useGrouping: false,
      maximumSignificantDigits: args["digit-count"],
    }),
  );
</script>

<div class="number">
  {data.scalar ? formatter.format(data.scalar[1] as number) : "-"}
</div>

<style>
  .number {
    font-family: monospace;
    font-size: 72px;
  }
</style>
