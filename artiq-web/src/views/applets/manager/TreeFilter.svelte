<script lang="ts">
  import type { Snippet } from "svelte";
  import { isRoot, traverse, type Node } from "../tree.svelte";

  let {
    root,
    children,
  }: {
    root: Node;
    children: Snippet<[Set<Node> | undefined]>;
  } = $props();

  let search = $state("");

  // Whitespace separates terms; quotes preserve phrases, even while unfinished.
  const terms = $derived(
    (search.toLowerCase().match(/"[^"]*(?:"|$)|[^\s"]+/g) ?? [])
      .map((term) => term.replace(/^"|"$/g, "").trim())
      .filter(Boolean),
  );

  const match = (nodes: Node[], strings: string[]): boolean => {
    const names = nodes
      .filter((n) => !isRoot(n))
      .map((n) => n.name.toLowerCase());

    return strings.every((s) => names.some((n) => n.includes(s)));
  };

  const matchingPathNodes = () => {
    const all = new Set<Node>();

    traverse(root, (ncurr, pcurr) => {
      if (!match([...pcurr, ncurr], terms)) return;

      pcurr.forEach((node) => all.add(node));
      all.add(ncurr);
    });

    return all;
  };

  const matches = $derived.by(() => {
    if (!terms.length) return undefined;
    return matchingPathNodes();
  });
</script>

<input
  type="search"
  bind:value={search}
  placeholder="Filter applets and groups…"
  aria-label="Filter applets and groups"
  title="All terms must match. Use quotes for phrases."
/>

{#if matches?.size === 0}
  <p>No matching applets or groups.</p>
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
