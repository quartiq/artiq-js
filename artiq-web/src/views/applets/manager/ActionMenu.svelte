<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  const id = $props.id();
  let left = $state(0);
  let top = $state(0);
</script>

<button
  type="button"
  popovertarget={id}
  aria-label="Actions"
  onclick={(event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    left = rect.left;
    top = rect.bottom;
  }}
>
  ⋮
</button>

<div
  {id}
  popover
  style:left={`${left}px`}
  style:top={`${top}px`}
  onclickcapture={(ev) => {
    if (!(ev.target instanceof Element)) return;

    const button = ev.target.closest("button");
    if (button?.parentElement !== ev.currentTarget) return;

    ev.currentTarget.hidePopover();
  }}
>
  {@render children()}
</div>

<style>
  div {
    position: fixed;
    inset: auto;
    margin: 0;
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    box-shadow: 0 0.25rem 0.75rem #0002;
  }

  div:popover-open {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  div[popover] :global(button) {
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
  }

  div[popover] :global(label) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  div[popover] :global(input[type="checkbox"]) {
    margin-inline: 0;
  }

  div[popover] :global(button:hover),
  div[popover] :global(label:hover) {
    background: var(--color-bg-beta);
  }
</style>
