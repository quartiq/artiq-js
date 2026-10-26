<script lang="ts">
  import shellQuote from "shell-quote";
  import type { LeafNode } from "./tree.svelte";

  let {
    applet,
  }: {
    applet: LeafNode;
  } = $props();

  const [name, ...argv] = $derived(shellQuote.parse(applet.command));
  const module = $derived(import(`./modules/${name}.svelte`));
</script>

{#await module then { default: View }}
  <View {argv} />
{:catch}
  <p>Could not load applet module: "{name}"</p>
{/await}
