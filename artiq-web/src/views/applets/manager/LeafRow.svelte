<script lang="ts">
  import { detach, contains, type LeafNode, type Node } from "../tree.svelte";
  import TreeItem from "./TreeItem.svelte";

  import PolicyCheckbox from "./PolicyCheckbox.svelte";
  import ActionMenu from "./ActionMenu.svelte";

  import AppletEdit from "../editor/AppletEdit.svelte";

  let {
    leaf = $bindable(),
    depth,
    dragged = $bindable(),
    target = $bindable(),
  }: {
    leaf: LeafNode;
    depth: number;
    dragged?: Node;
    target?: Node;
  } = $props();
</script>

<tr class:dropTarget={!!target && contains(target, leaf)}>
  <td>
    <ActionMenu>
      <AppletEdit {leaf} />
      <label>
        <input type="checkbox" bind:checked={leaf.visible} />
        Visible
      </label>
      <button type="button" onclick={() => detach(leaf)}>Remove</button>
    </ActionMenu>
  </td>

  <td>
    <PolicyCheckbox
      bind:value={leaf.policy.allowCreation}
      policy="allowCreation"
    />
  </td>

  <td>
    <PolicyCheckbox
      bind:value={leaf.policy.allowVisCtrl}
      policy="allowVisCtrl"
    />
  </td>

  <td class="name">
    <TreeItem node={leaf} {depth} bind:dragged bind:target>
      <span class:invisible={!leaf.visible}>{leaf.name}</span>
    </TreeItem>
  </td>
</tr>
