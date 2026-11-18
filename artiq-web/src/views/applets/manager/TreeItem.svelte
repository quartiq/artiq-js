<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Group } from "../ccb";
  import {
    isRoot,
    parent,
    branchFrom,
    contains,
    nameTaken,
  } from "../tree.svelte";
  import type { Node } from "../tree.svelte";

  let {
    node,
    group,
    depth = 0,
    dragged = $bindable(),
    expanded = $bindable(),
    children,
  }: {
    node: Node;
    group?: Group;
    depth?: number;
    dragged?: Node;
    expanded?: boolean;
    children: Snippet;
  } = $props();

  let over = $state(false);

  const src = $derived(dragged ? parent(dragged) : undefined);
  const dest = $derived(group ? branchFrom(group) : undefined);

  let droppable = $derived(
    !!dragged &&
      !isRoot(dragged) &&
      !!src &&
      !!dest &&
      src !== dest &&
      !contains(dragged, dest) &&
      !nameTaken(dest.children, dragged),
  );

  let ondragstart = (ev: DragEvent) => {
    if (isRoot(node) || !ev.dataTransfer) return;

    dragged = node;
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.setData("text/plain", node.name);
  };

  let ondragend = () => {
    dragged = undefined;
    over = false;
  };

  let ondragover = (ev: DragEvent) => {
    over = droppable;

    if (ev.dataTransfer)
      ev.dataTransfer.dropEffect = droppable ? "move" : "none";

    if (droppable) ev.preventDefault();
  };

  let ondragleave = (ev: DragEvent & { currentTarget: HTMLDivElement }) => {
    if (
      ev.relatedTarget instanceof Node &&
      ev.currentTarget.contains(ev.relatedTarget)
    )
      return;

    over = false;
  };

  let ondrop = (ev: DragEvent) => {
    over = false;
    if (!droppable || !dragged || !src || !dest || !group) return;

    ev.preventDefault();
    ev.stopPropagation();

    src.children.splice(src.children.indexOf(dragged), 1);
    dest.children.push(dragged);

    dragged = undefined;
  };
</script>

{#snippet content()}
  <span class="symbol" aria-hidden="true">
    {expanded === undefined ? "▪" : expanded ? "▾" : "▸"}
  </span>
  {@render children()}
{/snippet}

<div
  class="item"
  role="group"
  draggable={!isRoot(node)}
  class:over={over && droppable}
  {ondragstart}
  {ondragend}
  {ondragover}
  {ondragleave}
  {ondrop}
>
  {#if expanded === undefined}
    <div class="content" style:padding-left={`${depth}rem`}>
      {@render content()}
    </div>
  {:else}
    <button
      class="content"
      type="button"
      aria-expanded={expanded}
      style:padding-left={`${depth}rem`}
      onclick={() => (expanded = !expanded)}
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
    text-align: center;
  }
</style>
