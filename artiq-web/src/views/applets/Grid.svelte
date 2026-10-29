<script lang="ts">
  import type { Component } from "svelte";
  import type { LayoutItem } from "@appulsauce/svelte-grid";
  import Grid, { GridItem } from "@appulsauce/svelte-grid";
  import shellQuote from "shell-quote";

  import { root, leafs } from "./tree.svelte";

  type AppletModule = {
    default: Component<{ argv: string[] }>;
    size?: Pick<LayoutItem, "w" | "h">;
  };

  const modules = import.meta.glob<AppletModule>("./modules/*.svelte", {
    eager: true,
  });
</script>

<Grid cols={12} itemSize={{ height: 25 }}>
  {#each leafs(root) as applet (applet)}
    {#if applet.visible}
      {@const [name, ...argv] = shellQuote.parse(applet.command) as string[]}
      {@const module = modules[`./modules/${name}.svelte`]}

      {#if module}
        {@const View = module.default}
        <GridItem
          x={applet.geometry?.x ?? 0}
          y={applet.geometry?.y ?? 0}
          w={applet.geometry?.w ?? module.size?.w ?? 3}
          h={applet.geometry?.h ?? module.size?.h ?? 10}
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
            <View {argv} />
          </div>
        </GridItem>
      {:else}
        <p>Could not load applet module: "{name}"</p>
      {/if}
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
    overflow: hidden;
  }
</style>
