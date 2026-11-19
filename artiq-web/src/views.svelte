<script lang="ts">
  import "@fontsource/atkinson-hyperlegible-next/400.css";
  import "@fontsource/atkinson-hyperlegible-next/700.css";

  import type { Component } from "svelte";
  import { onMount } from "svelte";
  import * as net from "sipyco-js/net";

  import Navigation from "./Navigation.svelte";
  import "./reset.css";
  import "./typo.css";
  import "./colors.css";
  import "./inputs.css";
  import "./buttons.css";

  const views = import.meta.glob<{ default: Component }>("./views/*.svelte");
  const names = Object.keys(views).map((path) =>
    path.slice("./views/".length, -".svelte".length),
  );

  const load = views[`./views/${location.pathname.slice(1)}.svelte`];

  let failed = $state(false);
  onMount(() => net.onChange((status) => (failed = status === "failed")));
</script>

<Navigation {names} />

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
  :global(.hidden) {
    display: none !important;
  }

  :global(body) {
    height: 100dvh;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
  }

  :global(button) {
    color: inherit;
    background: transparent;
    border: 0;
    cursor: pointer;
    text-align: left;
  }

  :global(input[type="checkbox"]) {
    cursor: pointer;
  }

  main {
    min-height: 0;
  }

  .status {
    position: fixed;
    bottom: 0;
    width: 100%;
    background: mistyrose;
  }
</style>
