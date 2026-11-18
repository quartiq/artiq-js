<script lang="ts">
  import type { Group } from "./ccb";
  import { root, isLeaf } from "./tree.svelte";
  import type { Node } from "./tree.svelte";

  import LeafRow from "./manager/LeafRow.svelte";
  import BranchRow from "./manager/BranchRow.svelte";
  import RootRow from "./manager/RootRow.svelte";

  let dragged = $state<Node>();
</script>

{#snippet siblings(nodes: Node[], group: Group, depth: number)}
  {#each nodes as node, i (node)}
    {#if isLeaf(nodes[i])}
      <LeafRow bind:leaf={nodes[i]} {depth} bind:dragged />
    {:else}
      <BranchRow bind:branch={nodes[i]} {group} {depth} bind:dragged />
      {#if nodes[i].expanded}
        {@render siblings(
          nodes[i].children,
          [...group, nodes[i].name],
          depth + 1,
        )}
      {/if}
    {/if}
  {/each}
{/snippet}

<table>
  <tbody>
    <RootRow bind:dragged />
    {#if root.expanded}
      {@render siblings(root.children, [], 1)}
    {/if}
  </tbody>
</table>

<style>
  table {
    margin: 1rem 0;
    width: 100%;
    border-collapse: collapse;
  }

  table :global(.invisible) {
    opacity: 0.5;
    font-style: italic;
  }

  table :global(td) {
    white-space: nowrap;
  }

  table :global(td.name) {
    padding: 0;
  }

  table :global(td:not(:last-child)) {
    width: 1%;
  }

  table :global(tr:hover) {
    background: var(--color-bg-beta);
  }

  table :global(tr:has(.over)) {
    outline: 1px solid Highlight;
    outline-offset: -1px;
    background: color-mix(in srgb, Highlight 12%, transparent);
  }
</style>
