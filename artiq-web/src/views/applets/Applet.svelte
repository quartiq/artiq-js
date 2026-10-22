<script lang="ts">
  import shellQuote from "shell-quote";
  import type { LeafNode } from "./tree.svelte";

  let {
    applet,
  }: {
    applet: LeafNode;
  } = $props();

  const [name, ...args] = $derived(shellQuote.parse(applet.command));
  const module = $derived(import(`./modules/${name}.svelte`));
</script>

<h3>{applet.name}</h3>

{#await module then { default: View }}
  <View {args} />
{:catch}
  <p>Could not load applet module: "{name}"</p>
{/await}
