<script lang="ts">
  import { onMount } from "svelte";
  import Grid, { GridItem } from "@appulsauce/svelte-grid";
  import shellQuote from "shell-quote";

  import { root, leafs } from "./tree.svelte";
  import * as datasets from "artiq-js/datasets";

  const applets = $derived(leafs(root));
  let values = $state<Record<string, string>>({});

  onMount(() => {
    const { store, stop } = datasets.from({
      masterHostname: "localhost",
      onReceive: async () => {
        values = Object.fromEntries(
          [...(await store).struct.entries()].map(([key, dataset]) => [
            key,
            String(dataset[1]),
          ]),
        );
      },
    });

    return stop;
  });
</script>

<Grid cols={12} itemSize={{ height: 50 }}>
  {#each applets as applet, index (applet)}
    {@const dataset = shellQuote.parse(applet.command)[1]}

    {#if applet.visible}
      <GridItem x={0} y={index * 3} w={4} h={3}>
        <h3>{applet.name}</h3>
        <pre>{applet.command}</pre>
        {#if typeof dataset === "string"}
          <p>{dataset}: {values[dataset] ?? "-"}</p>
        {/if}
      </GridItem>
    {/if}
  {/each}
</Grid>
