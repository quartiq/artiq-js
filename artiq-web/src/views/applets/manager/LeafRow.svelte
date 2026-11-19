<script lang="ts">
  import { detach, contains, type LeafNode } from "../tree.svelte";
  import * as drag from "./drag.svelte";
  import NodeLabel from "./NodeLabel.svelte";

  import PolicyCheckbox from "./PolicyCheckbox.svelte";
  import ActionMenu from "./ActionMenu.svelte";

  import AppletEdit from "../editor/AppletEdit.svelte";

  let {
    leaf = $bindable(),
    depth,
  }: {
    leaf: LeafNode;
    depth: number;
  } = $props();
</script>

<tr class:dropTarget={!!drag.state.target && contains(drag.state.target, leaf)}>
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
    <NodeLabel node={leaf} {depth}>
      <span class:invisible={!leaf.visible}>{leaf.name}</span>
    </NodeLabel>
  </td>
</tr>
