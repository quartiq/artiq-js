<script lang="ts">
  import { flushSync } from "svelte";
  import type { Attachment } from "svelte/attachments";

  import { GridStack } from "gridstack";
  import type { GridStackWidget, GridItemHTMLElement } from "gridstack";
  import StageItem from "./StageItem.svelte";

  import { write, leafFrom } from "./tree";
  import type { LeafNode } from "./tree";
  import * as ccb from "./ccb";

  type KeyString = string;
  type Item = { id: KeyString; breadcrumb: string };
  let items = $state<Item[]>([]);

  const keystr = ({ group, name }: ccb.AppletKey): KeyString =>
    JSON.stringify({ group, name });
  const key = (str: KeyString): ccb.AppletKey => JSON.parse(str);

  let grid: GridStack;

  const init: Attachment<HTMLDivElement> = (stage) => {
    grid = GridStack.init({ handle: ".widget-header" }, stage);
  };

  export const listen = () => {
    grid.on("change", (_, items) => {
      items.forEach((item) => {
        const leaf = leafFrom(key(item.id!))!;
        const { x, y, w, h } = item;
        leaf.geometry = { x, y, w, h };
      });

      write();
    });
  };

  const newItem = (
    id: KeyString,
    breadcrumb: string,
    defaults: GridStackWidget,
  ): GridItemHTMLElement => {
    items.push({ id, breadcrumb });
    flushSync();

    // need to do it this way opposed to .addWidget()
    // to register drag area via "handle" option during init, further down
    return grid.makeWidget(findItem(id)!, { ...defaults, id });
  };

  // can not make use of Utils.find() since it holds stale DOM references during drag
  const findItem = (id: KeyString): GridItemHTMLElement | undefined =>
    grid.el.querySelector<GridItemHTMLElement>(
      `[data-stage-id="${CSS.escape(id)}"]`,
    ) ?? undefined;

  const cacheGeometry = (item: GridItemHTMLElement, leaf: LeafNode) => {
    if (item.gridstackNode === undefined) return;
    const { x, y, w, h } = item.gridstackNode;
    leaf.geometry = { x, y, w, h };
  };

  const revealItem = (item: GridItemHTMLElement, leaf: LeafNode) => {
    grid.makeWidget(item, { ...leaf.geometry, id: keystr(leaf) });
    item.classList.remove("hidden");
  };

  const hideItem = (item: GridItemHTMLElement) => {
    grid.removeWidget(item, false);
    item.classList.add("hidden");
  };

  const syncVis = (item: GridItemHTMLElement, leaf: LeafNode) => {
    if (leaf.visible && item.classList.contains("hidden")) {
      revealItem(item, leaf);
      return;
    }

    if (!leaf.visible && !item.classList.contains("hidden")) {
      hideItem(item);
    }
  };

  export const updateVisibility = (leafs: LeafNode[]) => {
    const tuples = leafs
      // insert new widgets bottom-right first, top-left last
      // don't push residing widgets all the way down
      .sort(
        (a, b) =>
          (b.geometry?.y ?? 0) - (a.geometry?.y ?? 0) ||
          (b.geometry?.x ?? 0) - (a.geometry?.x ?? 0),
      )
      .map((leaf): [GridItemHTMLElement | undefined, LeafNode] => [
        findItem(keystr(leaf)),
        leaf,
      ])
      .filter(
        (tuple): tuple is [GridItemHTMLElement, LeafNode] =>
          tuple[0] !== undefined,
      );

    tuples.forEach(([item, leaf]) => cacheGeometry(item, leaf));
    tuples.forEach(([item, leaf]) => syncVis(item, leaf));
  };

  export const remove = (k: ccb.AppletKey) => {
    const id = keystr(k);
    const item = findItem(id);
    if (!item) return;

    grid.removeWidget(item, false);
    items = items.filter((i) => i.id !== id);
    flushSync();
  };

  export const appletItem = (
    leaf: LeafNode,
    defaults: GridStackWidget | undefined,
  ): HTMLElement => {
    const keystring = keystr(leaf);
    let item = findItem(keystring);
    if (!item) {
      const breadcrumb = [...leaf.group, leaf.name].reverse().join(" — ");
      item = newItem(keystring, breadcrumb, {
        ...(defaults ?? { w: 5, h: 4 }),
        ...leaf.geometry,
      });
    }

    const host = item.querySelector(".widget-body") as HTMLElement;
    host.replaceChildren();

    cacheGeometry(item, leaf);
    syncVis(item, leaf);

    return host;
  };
</script>

<div class="stage" {@attach init}>
  {#each items as i (i.id)}
    <StageItem id={i.id} breadcrumb={i.breadcrumb} />
  {/each}
</div>

<style>
  @import "gridstack/dist/gridstack.min.css";

  :root {
    --sidebar-handle-width: 20px;
  }

  .stage {
    margin-left: var(--sidebar-handle-width);
  }
</style>
