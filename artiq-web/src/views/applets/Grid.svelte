<script lang="ts">
  import Grid, { GridItem } from "@appulsauce/svelte-grid";

  import { root, leafs } from "./tree.svelte";
  import Applet from "./Applet.svelte";
</script>

<Grid cols={12} itemSize={{ height: 25 }}>
  {#each leafs(root) as applet, index (applet)}
    {#if applet.visible}
      <GridItem
        x={applet.geometry?.x ?? 0}
        y={applet.geometry?.y ?? index * 6}
        w={applet.geometry?.w ?? 4}
        h={applet.geometry?.h ?? 6}
        min={{ w: 2, h: 3 }}
        onchange={({ item }) => {
          const { x, y, w, h } = item;
          applet.geometry = { x, y, w, h };
        }}
      >
        {#snippet moveHandle({ moveStart })}
          <h3 onpointerdown={moveStart}>{applet.name}</h3>
        {/snippet}

        <div class="body">
          <Applet {applet} />
        </div>
      </GridItem>
    {/if}
  {/each}
</Grid>

<style>
  :global(.item-default) {
    display: flex;
    flex-direction: column;
  }

  h3 {
    cursor: move;
  }

  .body {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
</style>
