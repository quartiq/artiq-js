<script lang="ts">
  import type { Component } from "svelte";
  import { onMount } from "svelte";
  import * as net from "sipyco-js/net";

  const views = import.meta.glob<{ default: Component }>("./views/*.svelte");
  const names = Object.keys(views).map((path) =>
    path.slice("./views/".length, -".svelte".length),
  );

  const load = views[`./views/${location.pathname.slice(1)}.svelte`];

  let failed = $state(false);
  onMount(() => net.onChange((status) => (failed = status === "failed")));
</script>

<nav>
  <span>Available views:</span>
  {#each names as n}
    <a href={`/${n}`}>{n}</a>
  {/each}
</nav>

<main>
  {#if load}
    {#await load() then { default: View }}
      <View />
    {/await}
  {/if}
</main>

{#if failed}
  <div class="status">
    Connection error. Are ARTIQ master and the WebSocket proxy running?
  </div>
{/if}

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(.hidden) {
    display: none !important;
  }

  :global(body) {
    margin: 0;
    height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  nav {
    flex-shrink: 0;
  }

  main {
    flex: 1;
    min-height: 0;
  }

  .status {
    position: fixed;
    bottom: 0;
    width: 100%;
    background: mistyrose;
  }
</style>
