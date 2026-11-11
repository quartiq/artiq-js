<script lang="ts">
  import type { Group } from "./ccb";
  import { root, detach, isLeaf } from "./tree.svelte";
  import type { Node } from "./tree.svelte";
  import PolicyCheckbox from "./PolicyCheckbox.svelte";

  import AppletCreate from "./editor/AppletCreate.svelte";
  import AppletEdit from "./editor/AppletEdit.svelte";
  import GroupCreate from "./editor/GroupCreate.svelte";
  import GroupEdit from "./editor/GroupEdit.svelte";
  import TreeItem from "./TreeItem.svelte";

  let dragged = $state<Node>();
</script>

<TreeItem node={root} group={[]} bind:dragged>
  <strong>Root</strong>
</TreeItem>

<label>
  <input type="checkbox" bind:checked={root.policy.allowCreation} />
  Allow CCB creation and update
</label>

<label>
  <input type="checkbox" bind:checked={root.policy.allowVisCtrl} />
  Allow CCB visibility control
</label>

{#snippet siblings(nodes: Node[], group: Group)}
  <ul>
    {#each nodes as node (node)}
      <li>
        {#if isLeaf(node)}
          <TreeItem {node} bind:dragged>
            <AppletEdit leaf={node} />
          </TreeItem>

          <label>
            <input type="checkbox" bind:checked={node.visible} />
            Visible
          </label>
        {:else}
          <button
            type="button"
            aria-expanded={node.expanded}
            aria-label={`${node.expanded ? "Collapse" : "Expand"} ${node.name}`}
            onclick={() => (node.expanded = !node.expanded)}
          >
            {node.expanded ? "▾" : "▸"}
          </button>
          <TreeItem {node} group={[...group, node.name]} bind:dragged>
            <GroupEdit branch={node} {group} />
          </TreeItem>
          <AppletCreate group={[...group, node.name]} />
          <GroupCreate group={[...group, node.name]} />
        {/if}

        <button type="button" onclick={() => detach(node)}>Remove</button>

        <PolicyCheckbox
          bind:value={node.policy.allowCreation}
          label="Allow CCB creation and update"
        />
        <PolicyCheckbox
          bind:value={node.policy.allowVisCtrl}
          label="Allow CCB visibility control"
        />

        {#if !isLeaf(node) && node.expanded}
          {@render siblings(node.children, [...group, node.name])}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<AppletCreate />
<GroupCreate />
{@render siblings(root.children, [])}
