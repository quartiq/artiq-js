<script lang="ts">
  import type { Snippet } from "svelte";
  import { isLeaf, type Node } from "../tree.svelte";

  let {
    root,
    children,
  }: {
    root: Node;
    children: Snippet<[Set<Node> | undefined]>;
  } = $props();

  let search = $state("");
  const query = $derived(search.trim().toLowerCase());

  const matches = $derived.by(() => {
    if (!query) return undefined;

    const result = new Set<Node>();

    function visit(node: Node): boolean {
      let matched = isLeaf(node) && node.name.toLowerCase().includes(query);

      for (const child of node.children) {
        if (visit(child)) matched = true;
      }

      if (matched) result.add(node);
      return matched;
    }

    visit(root);
    return result;
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
    padding: 0.4rem 0.6rem;
    background: var(--color-bg-beta);
    border: none;
    border-radius: 0.25rem;
  }

  input:focus-visible {
    outline: 2px solid var(--color-fg-alpha);
    outline-offset: -2px;
  }

  p {
    margin: 0.75rem;
    color: var(--color-fg-beta);
  }
</style>
