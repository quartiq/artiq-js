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
  <thead>
    <tr>
      <th rowspan="2" scope="col">Name</th>
      <th rowspan="2" scope="col">Actions</th>
      <th colspan="2" scope="colgroup">CCB</th>
    </tr>
    <tr>
      <th scope="col">Update</th>
      <th scope="col">Visibility</th>
    </tr>
  </thead>

  <tbody>
    <RootRow bind:dragged />
    {@render siblings(root.children, [], 1)}
  </tbody>
</table>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }
</style>
