<script lang="ts">
  import { onMount } from "svelte";

  import * as datasets from "./applets/datasets.svelte";
  import * as ccb from "./applets/ccb";
  import { leafFrom, newLeaf, write } from "./applets/tree.svelte";
  import * as permission from "./applets/permission";

  import Grid from "./applets/Grid.svelte";
  import Manager from "./applets/Manager.svelte";

  const create_applet = (args: ccb.CreateArgs) => {
    if (!permission.granted("allowCreation", args)) return;

    const leaf = Object.assign(leafFrom(args) ?? newLeaf(args), args);
    if (!permission.granted("allowVisCtrl", args)) return;

    leaf.visible = true;
  };

  const restart_applet = (key: ccb.TargetKey) => {
    permission.leafsByPolicy("allowVisCtrl", key).forEach((applet) => {
      applet.visible = true;
    });
  };

  const disable_applet = (key: ccb.TargetKey) => {
    permission.leafsByPolicy("allowVisCtrl", key).forEach((applet) => {
      applet.visible = false;
    });
  };

  $effect(() => write());

  onMount(datasets.listen);

  onMount(() => {
    ccb.handleFuncs({
      create_applet,
      restart_applet,
      disable_applet,

      // TODO: remove legacy alias from ARTIQ, see: https://git.m-labs.hk/M-Labs/artiq/issues/1871
      disable_applet_group: ({ group }) =>
        disable_applet({ group, name: null }),
    });

    return ccb.listen();
  });
</script>

<Manager />
<Grid />
