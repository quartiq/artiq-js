<script lang="ts">
  import { root, detach, isLeaf } from "./tree.svelte";
  import type { Node } from "./tree.svelte";
  import PolicyCheckbox from "./PolicyCheckbox.svelte";
</script>

<details class="root-policy">
  <summary>Experiment permissions</summary>
  <div class="settings">
    <label>
      <input type="checkbox" bind:checked={root.policy.allowCreation} />
      Create and update
    </label>
    <label>
      <input type="checkbox" bind:checked={root.policy.allowVisCtrl} />
      Control visibility
    </label>
  </div>
</details>

{#snippet settings(node: Node)}
  <details class="node-settings">
    <summary>Settings</summary>
    <div class="settings">
      {#if isLeaf(node)}
        <label class="command">
          Command
          <input bind:value={node.command} spellcheck="false" />
        </label>
      {/if}

      <PolicyCheckbox
        bind:value={node.policy.allowCreation}
        label="Create and update"
      />
      <PolicyCheckbox
        bind:value={node.policy.allowVisCtrl}
        label="Control visibility"
      />

      <small>− inherits the parent policy</small>

      <button class="remove" type="button" onclick={() => detach(node)}>
        Remove {isLeaf(node) ? "applet" : "group"}
      </button>
    </div>
  </details>
{/snippet}

{#snippet siblings(nodes: Node[])}
  <ul class="applet-tree">
    {#each nodes as node (node)}
      <li>
        {#if isLeaf(node)}
          <div class="leaf-row" class:visible={node.visible}>
            <label title={node.command}>
              <input type="checkbox" bind:checked={node.visible} />
              <span>{node.name}</span>
            </label>
            {@render settings(node)}
          </div>
        {:else}
          <details class="group" open>
            <summary>
              {node.name}
              <span class="count">{node.children.length}</span>
            </summary>
            {@render settings(node)}
            {@render siblings(node.children)}
          </details>
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

{@render siblings(root.children)}
