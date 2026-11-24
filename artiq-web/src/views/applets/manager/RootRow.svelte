<script lang="ts">
  import { root, leaves } from "../tree.svelte";
  import * as drag from "./drag.svelte";
  import NodeLabel from "./NodeLabel.svelte";

  import VisibilityControls from "./VisibilityControls.svelte";
  import ActionMenu from "./ActionMenu.svelte";
  import { labels } from "./PolicyCheckbox.svelte";

  import AppletCreate from "../editor/AppletCreate.svelte";
  import GroupCreate from "../editor/GroupCreate.svelte";

  let { filtering = false }: { filtering?: boolean } = $props();

  const hasInvisible = $derived(leaves(root).some(({ leaf }) => !leaf.visible));
  let menu: ActionMenu;
</script>

<tr class:dropTarget={drag.state.target === root}>
  <td>
    <input
      type="checkbox"
      bind:checked={root.policy.allowCreation}
      title={labels.allowCreation}
      aria-label={labels.allowCreation}
    />
  </td>

  <td>
    <input
      type="checkbox"
      bind:checked={root.policy.allowVisCtrl}
      title={labels.allowVisCtrl}
      aria-label={labels.allowVisCtrl}
    />
  </td>

  <td class="name">
    <NodeLabel
      node={root}
      bind:expanded={root.expanded}
      {filtering}
      oncontextmenu={(ev) => menu.open(ev)}
    >
      <i class:invisible={hasInvisible}>(root)</i>
    </NodeLabel>

    <ActionMenu bind:this={menu}>
      <VisibilityControls node={root} />
      <AppletCreate />
      <GroupCreate />
    </ActionMenu>
  </td>
</tr>
