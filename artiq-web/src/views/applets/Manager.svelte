<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Group } from "./ccb";
  import { root, isLeaf, type Node } from "./tree.svelte";
  import * as drag from "./manager/drag.svelte";

  import TreeFilter from "./manager/TreeFilter.svelte";
  import LeafRow from "./manager/LeafRow.svelte";
  import BranchRow from "./manager/BranchRow.svelte";
  import RootRow from "./manager/RootRow.svelte";

  onDestroy(drag.end);
</script>

{#snippet siblings(
  nodes: Node[],
  group: Group,
  depth: number,
  matches: Set<Node> | undefined,
)}
  {#each nodes as node, i (node)}
    {#if matches === undefined || matches.has(node)}
      {#if isLeaf(nodes[i])}
        <LeafRow bind:leaf={nodes[i]} {depth} />
      {:else}
        <BranchRow
          bind:branch={nodes[i]}
          {group}
          {depth}
          filtering={matches !== undefined}
        />
        {#if matches !== undefined || nodes[i].expanded}
          {@render siblings(
            nodes[i].children,
            [...group, nodes[i].name],
            depth + 1,
            matches,
          )}
        {/if}
      {/if}
    {/if}
  {/each}
{/snippet}

<TreeFilter {root}>
  {#snippet children(matches)}
    <table>
      <tbody>
        <RootRow filtering={matches !== undefined} />
        {#if matches !== undefined || root.expanded}
          {@render siblings(root.children, [], 1, matches)}
        {/if}
      </tbody>
    </table>
  {/snippet}
</TreeFilter>

<style>
  table {
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

  table :global(tr.dropTarget) {
    background: color-mix(in srgb, Highlight 12%, transparent);
  }
</style>
