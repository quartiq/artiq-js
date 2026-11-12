<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    left,
    right,
  }: {
    left: Snippet;
    right: Snippet;
  } = $props();

  let width = $state(320);
  let dragging = $state(false);
  let lastx = 0;

  let panels: HTMLDivElement;

  const resize = (value: number) => {
    const max = Math.max(0, panels.clientWidth - 160);
    width = Math.max(Math.min(160, max), Math.min(max, value));
  };
</script>

<div
  bind:this={panels}
  class="panels"
  style:grid-template-columns={`${width}px minmax(0, 1fr)`}
>
  <section>
    {@render left()}
  </section>

  <button
    class="divider"
    style:left={`${width}px`}
    type="button"
    aria-label="Divider"
    onpointerdown={(event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      lastx = event.clientX;
      dragging = true;
    }}
    onpointermove={(event) => {
      if (!dragging) return;
      resize(width + event.clientX - lastx);
      lastx = event.clientX;
    }}
    onpointerup={(event) => {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onlostpointercapture={() => (dragging = false)}
  ></button>

  <section>
    {@render right()}
  </section>
</div>

<style>
  .panels {
    position: relative;
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    height: 100%;
  }

  section {
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }

  .divider {
    position: absolute;
    inset-block: 0;
    width: 4px;
    transform: translateX(-50%);
    z-index: 1;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: col-resize;
    touch-action: none;
  }

  .divider:hover,
  .divider:focus-visible {
    background: #ccc;
  }
</style>
