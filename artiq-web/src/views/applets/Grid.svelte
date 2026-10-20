<script lang="ts">
  import { onMount } from "svelte";
  import Grid, { GridItem } from "@appulsauce/svelte-grid";

  import * as ccb from "./ccb";
  import { root, leafs, leafFrom, newLeaf } from "./tree.svelte";

  import * as datasets from "artiq-js/datasets";
  import shellQuote from "shell-quote";

  const applets = $derived(leafs(root));
  let values = $state<Record<string, string>>({});

  onMount(() => {
    ccb.handleFuncs({
      create_applet: (args) => {
        const leaf = leafFrom(args);
        leaf
          ? Object.assign(leaf, args)
          : Object.assign(newLeaf(args), {
              visible: true,
            });
      },

      restart_applet: () => {},
      disable_applet: () => {},
      disable_applet_group: () => {},
    });

    return ccb.listen();
  });

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
