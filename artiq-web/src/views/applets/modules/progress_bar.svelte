<script module lang="ts">
  export const size = { w: 3, h: 3 };
</script>

<script lang="ts">
  import type { Keypath } from "artiq-js/datasets";
  import { parse, resolve } from "../argparse";
  import type { Schema } from "../argparse";

  type Args = {
    counter: Keypath;
    min: number;
    max: number;
  };

  type Datasets = {
    counter: number;
  };

  let { argv }: { argv: string[] } = $props();

  const schema = {
    positionals: ["counter"],
    options: {
      default: { min: 0, max: 100 },
    },
  } satisfies Schema<Args>;

  const args = $derived(parse<Args>(argv, schema));
  const data = $derived(resolve<Datasets>(args, ["counter"]));
</script>

<progress
  value={data.counter ? data.counter[1] - args.min : undefined}
  max={args.max - args.min}
></progress>

<style>
  progress {
    width: 100%;
    height: 100%;
    border: none;
    background: #ddd;
  }

  progress::-webkit-progress-bar {
    background: #ddd;
  }

  progress::-webkit-progress-value {
    background: lime;
  }

  progress::-moz-progress-bar {
    background: lime;
  }
</style>
