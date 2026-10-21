<script lang="ts">
  import Grid, { GridItem } from "@appulsauce/svelte-grid";

  import { root, leafs } from "./tree.svelte";
  import Applet from "./Applet.svelte";
</script>

<Grid cols={12} itemSize={{ height: 50 }}>
  {#each leafs(root) as applet, index (applet)}
    {#if applet.visible}
      <GridItem x={0} y={index * 3} w={4} h={3}>
        <Applet {applet} />
      </GridItem>
    {/if}
  {/each}
</Grid>
