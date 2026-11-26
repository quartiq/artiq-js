<script lang="ts">
  import { detach, contains, type LeafNode } from "../tree.svelte";
  import * as drag from "./drag.svelte";
  import NodeLabel from "./NodeLabel.svelte";

  import PolicyCheckbox from "./PolicyCheckbox.svelte";
  import ActionMenu from "./ActionMenu.svelte";

  import AppletEdit from "../editor/AppletEdit.svelte";
  import { isSelected, registerRow, selectItem } from "../select.svelte";

  let {
    leaf = $bindable(),
    depth,
  }: {
    leaf: LeafNode;
    depth: number;
  } = $props();

  let menu: ActionMenu;
  let editor: ReturnType<typeof AppletEdit>;
</script>

<tr
  class:dropTarget={!!drag.state.target && contains(drag.state.target, leaf)}
  class:selected={isSelected(leaf)}
  {@attach (el) => registerRow(leaf, el)}
>
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
    <NodeLabel
      node={leaf}
      {depth}
      oncontextmenu={(ev) => menu.open(ev)}
      onclick={() => selectItem(leaf)}
      ondblclick={() => editor.open()}
    >
      <span class:invisible={!leaf.visible}>{leaf.name}</span>
    </NodeLabel>

    <ActionMenu bind:this={menu}>
      <AppletEdit {leaf} bind:this={editor} />
      <label>
        <input type="checkbox" bind:checked={leaf.visible} />
        Visible
      </label>
      <button type="button" onclick={() => detach(leaf)}>Remove</button>
    </ActionMenu>
  </td>
</tr>
