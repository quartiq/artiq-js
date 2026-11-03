<script lang="ts">
  import type { Group } from "./ccb";
  import { root, detach, isLeaf } from "./tree.svelte";
  import type { Node } from "./tree.svelte";
  import PolicyCheckbox from "./PolicyCheckbox.svelte";

  import Create from "./editor/Create.svelte";
  import Edit from "./editor/Edit.svelte";
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
          <Edit applet={node} />

          <label>
            <input type="checkbox" bind:checked={node.visible} />
            Visible
          </label>
        {:else}
          <strong>{node.name}</strong>
          <Create group={[...group, node.name]} />
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

<Create />
{@render siblings(root.children, [])}
