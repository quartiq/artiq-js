<script lang="ts">
  import { root, type Node } from "../tree.svelte";
  import TreeItem from "./TreeItem.svelte";

  import VisibilityControls from "./VisibilityControls.svelte";
  import ActionMenu from "./ActionMenu.svelte";

  import AppletCreate from "../editor/AppletCreate.svelte";
  import GroupCreate from "../editor/GroupCreate.svelte";

  let { dragged = $bindable() }: { dragged?: Node } = $props();
</script>

<tr>
  <td>
    <TreeItem node={root} group={[]} bind:dragged>
      <strong>Root</strong>
    </TreeItem>
  </td>

  <td>
    <ActionMenu>
      <VisibilityControls node={root} />
      <AppletCreate />
      <GroupCreate />
    </ActionMenu>
  </td>

  <td>
    <input type="checkbox" bind:checked={root.policy.allowCreation} />
  </td>

  <td>
    <input type="checkbox" bind:checked={root.policy.allowVisCtrl} />
  </td>
</tr>
