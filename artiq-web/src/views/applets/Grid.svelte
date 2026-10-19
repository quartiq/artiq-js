<script lang="ts">
  import { onMount } from "svelte";
  import Grid, { GridItem } from "@appulsauce/svelte-grid";
  import * as ccb from "./ccb";

  let applets = $state<ccb.CreateArgs[]>([]);

  onMount(() => {
    ccb.handleFuncs({
      create_applet: (args) => {
        const applet = applets.find((a) => ccb.sameKey(a, args));
        if (applet) {
          Object.assign(applet, args);
          return;
        }

        applets.push(args);
      },

      restart_applet: () => {},
      disable_applet: () => {},
      disable_applet_group: () => {},
    });

    return ccb.listen();
  });
</script>

<Grid cols={12} itemSize={{ height: 50 }}>
  {#each applets as applet, index (applet)}
    <GridItem x={0} y={index * 3} w={4} h={3}>
      <h3>{applet.name}</h3>
      <pre>{applet.command}</pre>
    </GridItem>
  {/each}
</Grid>
