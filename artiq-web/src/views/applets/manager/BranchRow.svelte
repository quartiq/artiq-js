<script lang="ts">
  import type { Group } from "../ccb";
  import { detach, type BranchNode, type Node } from "../tree.svelte";
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
</script>

<tr>
  <td style:padding-left={`${depth}rem`}>
    <button
      type="button"
      aria-expanded={branch.expanded}
      aria-label={`${branch.expanded ? "Collapse" : "Expand"} ${branch.name}`}
      onclick={() => (branch.expanded = !branch.expanded)}
    >
      {branch.expanded ? "▾" : "▸"}
    </button>
    <TreeItem node={branch} group={path} bind:dragged>
      {branch.name}
    </TreeItem>
  </td>

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
      label="Allow CCB creation and update"
    />
  </td>

  <td>
    <PolicyCheckbox
      bind:value={branch.policy.allowVisCtrl}
      label="Allow CCB visibility control"
    />
  </td>
</tr>
