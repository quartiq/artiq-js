<script lang="ts">
  import { detach, type LeafNode, type Node } from "../tree.svelte";
  import TreeItem from "./TreeItem.svelte";
  import PolicyCheckbox from "./PolicyCheckbox.svelte";
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
      <AppletEdit {leaf} />
    </TreeItem>
  </td>

  <td>
    <input type="checkbox" bind:checked={leaf.visible} />
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

  <td>
    <button type="button" onclick={() => detach(leaf)}>Remove</button>
  </td>
</tr>
