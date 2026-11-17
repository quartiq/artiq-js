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

  <td style:padding-left={`${depth}rem`}>
    <span class="symbol">▪</span>
    <TreeItem node={leaf} bind:dragged>
      <span class:invisible={!leaf.visible}>{leaf.name}</span>
    </TreeItem>
  </td>
</tr>

<style>
  .symbol {
    display: inline-block;
    width: 2rem;
    text-align: center;
  }
</style>
