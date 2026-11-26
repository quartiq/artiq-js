<script lang="ts">
  import type { Snippet } from "svelte";
  import { isRoot, isLeaf } from "../tree.svelte";
  import type { Node } from "../tree.svelte";
  import * as drag from "./drag.svelte";
  import Icon from "../../../Icon.svelte";

  let {
    node,
    depth = 0,
    expanded = $bindable(),
    filtering = false,
    onclick,
    ondblclick,
    oncontextmenu,
    children,
  }: {
    node: Node;
    depth?: number;
    expanded?: boolean;
    filtering?: boolean;
    onclick?: () => void;
    ondblclick?: () => void;
    oncontextmenu?: (ev: MouseEvent) => void;
    children: Snippet;
  } = $props();

  const open = $derived(filtering || expanded);
</script>

{#snippet content()}
  <span
    class="symbol"
    style:color={isLeaf(node)
      ? "var(--color-fg-alpha)"
      : "var(--color-fg-beta)"}
    aria-hidden="true"
  >
    <Icon
      name={isLeaf(node) ? "chart-spline" : "chevron-right"}
      rotate={!isLeaf(node) && open ? 90 : 0}
    />
  </span>
  {@render children()}
{/snippet}

<div
  class="item"
  role="group"
  {oncontextmenu}
  draggable={!isRoot(node)}
  ondragstart={(ev) => drag.start(ev, node)}
  ondragend={drag.end}
  ondragover={(ev) => drag.over(ev, node)}
  ondragleave={(ev) => drag.leave(ev, node)}
  ondrop={(ev) => drag.drop(ev, node)}
>
  {#if isLeaf(node)}
    <button
      class="content"
      type="button"
      style:padding-left={`${depth}rem`}
      {onclick}
      {ondblclick}
    >
      {@render content()}
    </button>
  {:else}
    <button
      class="content"
      type="button"
      aria-expanded={open}
      style:padding-left={`${depth}rem`}
      onclick={() => {
        if (!filtering) expanded = !expanded;
      }}
    >
      {@render content()}
    </button>
  {/if}
</div>

<style>
  .item[draggable="true"],
  .item[draggable="true"] > .content {
    cursor: pointer;
  }

  .content {
    display: flex;
    width: 100%;
    padding: 0.25rem 0;
  }

  .symbol {
    flex: 0 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
