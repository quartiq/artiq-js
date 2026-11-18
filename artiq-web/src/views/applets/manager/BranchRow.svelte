<script lang="ts">
  import type { Group } from "../ccb";
  import { detach, leaves, type BranchNode, type Node } from "../tree.svelte";
  import TreeItem from "./TreeItem.svelte";

  import PolicyCheckbox from "./PolicyCheckbox.svelte";
  import VisibilityControls from "./VisibilityControls.svelte";
  import ActionMenu from "./ActionMenu.svelte";

  import GroupEdit from "../editor/GroupEdit.svelte";
  import AppletCreate from "../editor/AppletCreate.svelte";
  import GroupCreate from "../editor/GroupCreate.svelte";

  let {
    branch = $bindable(),
    group,
    depth,
    dragged = $bindable(),
  }: {
    branch: BranchNode;
    group: Group;
    depth: number;
    dragged?: Node;
  } = $props();

  const path = $derived([...group, branch.name]);

  const hasInvisible = $derived(
    leaves(branch).some(({ leaf }) => !leaf.visible),
  );
</script>

<tr>
  <td>
    <ActionMenu>
      <GroupEdit {branch} {group} />
      <VisibilityControls node={branch} />
      <AppletCreate group={path} />
      <GroupCreate group={path} />
      <button type="button" onclick={() => detach(branch)}>Remove</button>
    </ActionMenu>
  </td>

  <td>
    <PolicyCheckbox
      bind:value={branch.policy.allowCreation}
      policy="allowCreation"
    />
  </td>

  <td>
    <PolicyCheckbox
      bind:value={branch.policy.allowVisCtrl}
      policy="allowVisCtrl"
    />
  </td>

  <td class="name">
    <TreeItem
      node={branch}
      group={path}
      {depth}
      bind:expanded={branch.expanded}
      bind:dragged
    >
      <span class:invisible={hasInvisible}>{branch.name}</span>
    </TreeItem>
  </td>
</tr>
