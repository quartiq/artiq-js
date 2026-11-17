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
</style>
