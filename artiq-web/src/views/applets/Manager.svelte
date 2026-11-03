<script lang="ts">
  import type { Group } from "./ccb";
  import { root, detach, isLeaf } from "./tree.svelte";
  import type { Node } from "./tree.svelte";
  import PolicyCheckbox from "./PolicyCheckbox.svelte";

  import AppletCreate from "./editor/AppletCreate.svelte";
  import AppletEdit from "./editor/AppletEdit.svelte";
  import GroupCreate from "./editor/GroupCreate.svelte";
</script>

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
          <AppletEdit applet={node} />

          <label>
            <input type="checkbox" bind:checked={node.visible} />
            Visible
          </label>
        {:else}
          <strong>{node.name}</strong>
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

        {#if !isLeaf(node)}
          {@render siblings(node.children, [...group, node.name])}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<AppletCreate />
<GroupCreate />
{@render siblings(root.children, [])}
