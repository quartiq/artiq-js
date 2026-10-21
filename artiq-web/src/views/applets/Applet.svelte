<script lang="ts">
  import shellQuote from "shell-quote";

  import { map } from "./datasets.svelte";
  import type { LeafNode } from "./tree.svelte";

  let {
    applet,
  }: {
    applet: LeafNode;
  } = $props();

  const keypath = $derived(shellQuote.parse(applet.command)[1]);
</script>

<h3>{applet.name}</h3>
<pre>{applet.command}</pre>
{#if typeof keypath === "string"}
  {@const dataset = map.get(keypath)}
  <p>{keypath}: {dataset ? String(dataset[1]) : "-"}</p>
{/if}
