<script lang="ts">
  import { detach, type LeafNode, type Node } from "../tree.svelte";
  import TreeItem from "./TreeItem.svelte";

  import PolicyCheckbox from "./PolicyCheckbox.svelte";
  import ActionMenu from "./ActionMenu.svelte";

  import AppletEdit from "../editor/AppletEdit.svelte";

  let {
    leaf = $bindable(),
    depth,
    dragged = $bindable(),
  }: {
    leaf: LeafNode;
    depth: number;
    dragged?: Node;
  } = $props();
</script>

<tr>
  <td style:padding-left={`${depth}rem`}>
    <TreeItem node={leaf} bind:dragged>
      {leaf.name}
    </TreeItem>
  </td>

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
      label="Allow CCB creation and update"
    />
  </td>

  <td>
    <PolicyCheckbox
      bind:value={leaf.policy.allowVisCtrl}
      label="Allow CCB visibility control"
    />
  </td>
</tr>
