<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Group } from "./ccb";
  import {
    isRoot,
    parent,
    groupFrom,
    contains,
    dup,
  } from "./tree.svelte";
  import type { Node } from "./tree.svelte";

  let {
    node,
    group,
    dragged = $bindable(),
    children,
  }: {
    node: Node;
    group?: Group;
    dragged?: Node;
    children: Snippet;
  } = $props();

  let over = $state(false);

  const src = $derived(dragged ? parent(dragged) : undefined);
  const dest = $derived(group ? groupFrom(group) : undefined);

  let droppable = $derived(
    !!dragged &&
      !isRoot(dragged) &&
      !!src &&
      !!dest &&
      src !== dest &&
      !contains(dragged, dest) &&
      !dup(dragged, dest),
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

<div
  role="group"
  draggable={!isRoot(node)}
  class:over={over && droppable}
  {ondragstart}
  {ondragend}
  {ondragover}
  {ondragleave}
  {ondrop}
>
  {@render children()}
</div>

<style>
  div {
    display: inline-block;
    border: 1px solid transparent;
    padding: 0.2rem;
  }

  div[draggable="true"] {
    cursor: grab;
  }

  .over {
    border-color: Highlight;
    background: color-mix(in srgb, Highlight 12%, transparent);
  }
</style>
