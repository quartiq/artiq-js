<script lang="ts">
  import { onMount } from "svelte";

  import Grid from "./applets/Grid.svelte";
  import Manager from "./applets/Manager.svelte";

  import { groupFrom, leafFrom, leafs, newLeaf } from "./applets/tree.svelte";
  import * as ccb from "./applets/ccb";

  const create_applet = (args: ccb.CreateArgs) => {
    const leaf = leafFrom(args);
    leaf
      ? Object.assign(leaf, args)
      : Object.assign(newLeaf(args), {
          visible: true,
        });
  };

  const disable_applet = ({ group, name }: ccb.TargetKey) => {
    const node = name === null ? groupFrom(group) : leafFrom({ group, name });

    if (!node) return;
    leafs(node).forEach((applet) => (applet.visible = false));
  };

  onMount(() => {
    ccb.handleFuncs({
      create_applet,
      restart_applet: () => {},
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
