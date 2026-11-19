<script lang="ts">
  import type { Snippet } from "svelte";
  import { isLeaf, traverse, type Node } from "../tree.svelte";

  let {
    root,
    children,
  }: {
    root: Node;
    children: Snippet<[Set<Node> | undefined]>;
  } = $props();

  let search = $state("");
  const query = $derived(search.trim().toLowerCase());

  const match = (n: Node, s: string) =>
    isLeaf(n) && n.name.toLowerCase().includes(s);

  const matchingPathNodes = () => {
    const all = new Set<Node>();

    traverse(root, (ncurr, pcurr) => {
      if (!match(ncurr, query)) return;

      pcurr.forEach((node) => all.add(node));
      all.add(ncurr);
    });

    return all;
  };

  const matches = $derived.by(() => {
    if (!query) return undefined;
    return matchingPathNodes();
  });
</script>

<input
  type="search"
  bind:value={search}
  placeholder="Filter applets…"
  aria-label="Filter applets by name"
/>

{#if matches?.size === 0}
  <p>No matching applets.</p>
{/if}

{@render children(matches)}

<style>
  input {
    width: calc(100% - 1rem);
    margin: 0.5rem;
  }

  p {
    margin: 0.75rem;
    color: var(--color-fg-beta);
  }
</style>
