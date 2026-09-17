import { GridStack, GridStackWidget, GridItemHTMLElement } from "gridstack";
import { LeafNode, leafFrom, write } from "./tree";
import * as ccb from "./ccb";

type KeyString = string;

const keystr = ({ group, name }: ccb.AppletKey): KeyString =>
  JSON.stringify({ group, name });
const key = (str: KeyString): ccb.AppletKey => JSON.parse(str);

let grid: GridStack;
export const init = () => {
  const host = document.createElement("div");
  host.classList.add("grid-stack");
  document.body.append(host);

  grid = GridStack.init({ handle: ".widget-header" });
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
  grid: GridStack,
  defaults: GridStackWidget,
) => {
  grid.el.append(item);

  // need to do it this way opposed to .addWidget()
  // to register drag area via "handle" option during init, further down
  grid.makeWidget(item, { ...defaults, id });
};

const findItem = (
  keystring: KeyString,
  grid: GridStack,
): GridItemHTMLElement | undefined => {
  // can not make use of Utils.find() since it holds stale DOM references during drag
  const el = grid.el.querySelector(`[gs-id="${CSS.escape(keystring)}"]`);
  return (el ?? undefined) as GridItemHTMLElement | undefined;
};

const cacheGeometry = (item: GridItemHTMLElement, leaf: LeafNode) => {
  if (item.gridstackNode === undefined) return;
  const { x, y, w, h } = item.gridstackNode;
  leaf.geometry = { x, y, w, h };
};

const revealItem = (
  item: GridItemHTMLElement,
  leaf: LeafNode,
  grid: GridStack,
) => {
  grid.makeWidget(item, { ...leaf.geometry, id: keystr(leaf) });
  item.classList.remove("hidden");
};

const hideItem = (item: GridItemHTMLElement, grid: GridStack) => {
  grid.removeWidget(item, false);
  item.classList.add("hidden");
};

const syncVis = (
  item: GridItemHTMLElement,
  leaf: LeafNode,
  grid: GridStack,
) => {
  if (leaf.visible && item.classList.contains("hidden")) {
    revealItem(item, leaf, grid);
    return;
  }

  if (!leaf.visible && !item.classList.contains("hidden")) {
    hideItem(item, grid);
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
      findItem(keystr(leaf), grid),
      leaf,
    ])
    .filter(
      (tuple): tuple is [GridItemHTMLElement, LeafNode] =>
        tuple[0] !== undefined,
    );

  tuples.forEach(([item, leaf]) => cacheGeometry(item, leaf));
  tuples.forEach(([item, leaf]) => syncVis(item, leaf, grid));
};

export const remove = (k: ccb.AppletKey) => {
  const item = findItem(keystr(k), grid);
  if (!item) return;
  grid.removeWidget(item);
};

export const newTemplateItem = (
  leaf: LeafNode,
  defaults: GridStackWidget | undefined,
): HTMLElement => {
  const keystring = keystr(leaf);
  let item = findItem(keystring, grid);
  if (!item) {
    const breadcrumb = [...leaf.group, leaf.name].reverse().join(" — ");
    item = newItem(breadcrumb, "applet");
    activateItem(keystring, item, grid, {
      ...(defaults ?? { w: 5, h: 4 }),
      ...leaf.geometry,
    });
  }

  const host = item.querySelector(".widget-body") as HTMLElement;
  host.className = "widget-body";
  host.replaceChildren();

  cacheGeometry(item, leaf);
  syncVis(item, leaf, grid);

  return host;
};
