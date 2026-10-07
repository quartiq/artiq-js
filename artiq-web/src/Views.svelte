<script lang="ts">
  import type { Component } from "svelte";

  const views = import.meta.glob<{ default: Component }>("./views/*.svelte");
  const names = Object.keys(views).map((path) =>
    path.slice("./views/".length, -".svelte".length),
  );

  const load = views[`./views/${location.pathname.slice(1)}.svelte`];
</script>

<nav>
  <span>Available views:</span>
  {#each names as n}
    <a href={`/${n}`}>{n}</a>
  {/each}
</nav>

{#if load}
  {#await load() then { default: View }}
    <View />
  {/await}
{/if}
