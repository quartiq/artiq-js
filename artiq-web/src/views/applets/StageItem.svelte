<script lang="ts">
  import { onMount, untrack } from "svelte";
  import type { AppletKey } from "./ccb";

  type Setup = (host: HTMLElement) => void;

  let {
    id,
    group,
    name,
    attach,
    setup,
  }: AppletKey & {
    id: string;
    attach: (el: HTMLDivElement) => () => void;
    setup: Setup;
  } = $props();

  let item: HTMLDivElement;
  let body: HTMLDivElement;

  const breadcrumb = $derived([...group, name].reverse().join(" — "));

  const init = (setup: Setup) => {
    untrack(() => {
      body.replaceChildren();
      setup(body);
    });
  };

  onMount(() => {
    // need to do it this way opposed to .addWidget()
    // to register drag area via "handle" option during init, further down
    const detach = attach(item);
    $effect(() => init(setup));
    return detach;
  });
</script>

<div class="grid-stack-item" data-stage-id={id} bind:this={item}>
  <div class="grid-stack-item-content">
    <div class="widget-header">{breadcrumb}</div>
    <div class="widget-body" bind:this={body}></div>
  </div>
</div>

<style>
  .grid-stack-item {
    border: 1px solid blue;
  }

  :global(.grid-stack) .grid-stack-item > .grid-stack-item-content {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .widget-header {
    flex: 0 0 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: move;
    background: blue;
    color: white;
  }

  .widget-body {
    position: relative;
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
    overflow: auto;
    min-height: 0;
  }

  .widget-body > :global(*) {
    flex: 1 1 0;
    min-width: 0;
  }

  .widget-body > :global(.js-plotly-plot) {
    height: 100%;
  }

  .grid-stack-item > :global(.ui-resizable-se) {
    bottom: 0;
    right: 0;
  }
</style>
