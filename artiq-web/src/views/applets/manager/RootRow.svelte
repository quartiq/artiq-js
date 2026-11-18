<script lang="ts">
  import { root, type Node } from "../tree.svelte";
  import TreeItem from "./TreeItem.svelte";

  import VisibilityControls from "./VisibilityControls.svelte";
  import ActionMenu from "./ActionMenu.svelte";
  import { labels } from "./PolicyCheckbox.svelte";

  import AppletCreate from "../editor/AppletCreate.svelte";
  import GroupCreate from "../editor/GroupCreate.svelte";

  let {
    dragged = $bindable(),
    target = $bindable(),
  }: {
    dragged?: Node;
    target?: Node;
  } = $props();
</script>

<tr class:dropTarget={target === root}>
  <td>
    <ActionMenu>
      <VisibilityControls node={root} />
      <AppletCreate />
      <GroupCreate />
    </ActionMenu>
  </td>

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
    <TreeItem
      node={root}
      group={[]}
      bind:expanded={root.expanded}
      bind:dragged
      bind:target
    >
      <strong>Root</strong>
    </TreeItem>
  </td>
</tr>
