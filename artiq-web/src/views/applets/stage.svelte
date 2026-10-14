<script lang="ts">
  import type { Attachment } from "svelte/attachments";

  import { GridStack } from "gridstack";
  import type { GridStackWidget, GridItemHTMLElement } from "gridstack";
  import { write, leafFrom } from "./tree";
  import type { LeafNode } from "./tree";
  import * as ccb from "./ccb";

  type KeyString = string;

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

  const newItem = (title: string, className?: string): GridItemHTMLElement => {
    const item = document.createElement("div");
    item.classList.add("grid-stack-item");
    if (className) item.classList.add(className);

    const content = document.createElement("div");
    content.classList.add("grid-stack-item-content");

    const header = document.createElement("div");
    header.classList.add("widget-header");
    header.innerText = title;

    const body = document.createElement("div");
    body.classList.add("widget-body");

    content.append(header, body);
    item.append(content);
    return item;
  };

  const activateItem = (
    id: string,
    item: GridItemHTMLElement,
    defaults: GridStackWidget,
  ) => {
    grid.el.append(item);

    // need to do it this way opposed to .addWidget()
    // to register drag area via "handle" option during init, further down
    grid.makeWidget(item, { ...defaults, id });
  };

  const findItem = (keystring: KeyString): GridItemHTMLElement | undefined => {
    // can not make use of Utils.find() since it holds stale DOM references during drag
    const el = grid.el.querySelector(`[gs-id="${CSS.escape(keystring)}"]`);
    return (el ?? undefined) as GridItemHTMLElement | undefined;
  };

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
    const item = findItem(keystr(k));
    if (!item) return;
    grid.removeWidget(item);
  };

  export const appletItem = (
    leaf: LeafNode,
    defaults: GridStackWidget | undefined,
  ): HTMLElement => {
    const keystring = keystr(leaf);
    let item = findItem(keystring);
    if (!item) {
      const breadcrumb = [...leaf.group, leaf.name].reverse().join(" — ");
      item = newItem(breadcrumb, "applet");
      activateItem(keystring, item, {
        ...(defaults ?? { w: 5, h: 4 }),
        ...leaf.geometry,
      });
    }

    const host = item.querySelector(".widget-body") as HTMLElement;
    host.className = "widget-body";
    host.replaceChildren();

    cacheGeometry(item, leaf);
    syncVis(item, leaf);

    return host;
  };
</script>

<div class="stage" {@attach init}></div>

<style>
  @import "gridstack/dist/gridstack.min.css";

  :root {
    --sidebar-handle-width: 20px;
  }

  .stage {
    margin-left: var(--sidebar-handle-width);
  }

  .stage :global(.grid-stack-item) {
    border: 1px solid blue;
  }

  .stage :global(.grid-stack-item > .ui-resizable-se) {
    bottom: 0;
    right: 0;
  }

  .stage :global(.grid-stack-item > .grid-stack-item-content) {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .stage :global(.widget-header) {
    flex: 0 0 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: move;
    background: blue;
    color: white;
  }

  .stage :global(.widget-body) {
    position: relative;
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
    overflow: auto;
    min-height: 0;
  }

  .stage :global(.widget-body > *) {
    flex: 1 1 0;
    min-width: 0;
  }

  .stage :global(.widget-body > .js-plotly-plot) {
    height: 100%;
  }
</style>
