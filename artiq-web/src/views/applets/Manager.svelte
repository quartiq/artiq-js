<script lang="ts">
  import PolicyCheckbox from "./PolicyCheckbox.svelte";
  import { root, detach, isLeaf } from "./tree.svelte";
  import type { Node } from "./tree.svelte";
</script>

<label>
  <input type="checkbox" bind:checked={root.policy.allowCreation} />
  Allow CCB creation and update
</label>

<label>
  <input type="checkbox" bind:checked={root.policy.allowVisCtrl} />
  Allow CCB visibility control
</label>

{#snippet siblings(nodes: Node[])}
  <ul>
    {#each nodes as node (node)}
      <li>
        {#if isLeaf(node)}
          <label>
            {node.name}
            <input bind:value={node.command} />
          </label>

          <label>
            <input type="checkbox" bind:checked={node.visible} />
            Visible
          </label>
        {:else}
          <strong>{node.name}</strong>
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
          {@render siblings(node.children)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

{@render siblings(root.children)}
