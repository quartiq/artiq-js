<script lang="ts">
  import shellQuote from "shell-quote";

  import type { LeafNode } from "./tree.svelte";

  let {
    applet,
    values,
  }: {
    applet: LeafNode;
    values: Record<string, string>;
  } = $props();

  const dataset = $derived(shellQuote.parse(applet.command)[1]);
</script>

<h3>{applet.name}</h3>
<pre>{applet.command}</pre>
{#if typeof dataset === "string"}
  <p>{dataset}: {values[dataset] ?? "-"}</p>
{/if}
