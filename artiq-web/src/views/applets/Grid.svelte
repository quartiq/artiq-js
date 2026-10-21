<script lang="ts">
  import { onMount } from "svelte";
  import Grid, { GridItem } from "@appulsauce/svelte-grid";

  import * as datasets from "artiq-js/datasets";
  import { root, leafs } from "./tree.svelte";
  import Applet from "./Applet.svelte";

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
    {#if applet.visible}
      <GridItem x={0} y={index * 3} w={4} h={3}>
        <Applet {applet} {values} />
      </GridItem>
    {/if}
  {/each}
</Grid>
