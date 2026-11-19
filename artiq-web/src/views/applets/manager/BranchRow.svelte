<script lang="ts">
  import type { Group } from "../ccb";
  import { detach, contains, leaves, type BranchNode } from "../tree.svelte";
  import * as drag from "./drag.svelte";
  import NodeLabel from "./NodeLabel.svelte";

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
    filtering = false,
  }: {
    branch: BranchNode;
    group: Group;
    depth: number;
    filtering?: boolean;
  } = $props();

  const path = $derived([...group, branch.name]);

  const hasInvisible = $derived(
    leaves(branch).some(({ leaf }) => !leaf.visible),
  );
</script>

<tr
  class:dropTarget={!!drag.state.target && contains(drag.state.target, branch)}
>
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
    <NodeLabel
      node={branch}
      {depth}
      bind:expanded={branch.expanded}
      {filtering}
    >
      <span class:invisible={hasInvisible}>{branch.name}</span>
    </NodeLabel>
  </td>
</tr>
