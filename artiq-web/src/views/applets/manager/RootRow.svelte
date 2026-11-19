<script lang="ts">
  import { root } from "../tree.svelte";
  import * as drag from "./drag.svelte";
  import NodeLabel from "./NodeLabel.svelte";

  import VisibilityControls from "./VisibilityControls.svelte";
  import ActionMenu from "./ActionMenu.svelte";
  import { labels } from "./PolicyCheckbox.svelte";

  import AppletCreate from "../editor/AppletCreate.svelte";
  import GroupCreate from "../editor/GroupCreate.svelte";

  let { filtering = false }: { filtering?: boolean } = $props();
</script>

<tr class:dropTarget={drag.state.target === root}>
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
    <NodeLabel node={root} bind:expanded={root.expanded} {filtering}>
      <span title="All applets">𝕌<sub>applets</sub></span>
    </NodeLabel>
  </td>
</tr>
