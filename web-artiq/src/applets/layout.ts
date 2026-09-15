import { GridStack, GridStackWidget, GridItemHTMLElement } from "gridstack";
import { LeafNode, leafFrom, write } from "./tree";
import * as ccb from "./ccb";

type KeyString = string;

let keystr = ({ group, name }: ccb.AppletKey): KeyString => JSON.stringify({ group, name });
let key = (str: KeyString): ccb.AppletKey => JSON.parse(str);

let grid: GridStack;
export let init = () => {
    let host = document.createElement("div");
    host.classList.add("grid-stack");
    document.body.append(host);

    grid = GridStack.init({ handle: ".widget-header" });
};

export let listen = () => {
    grid.on("change", (_, items) => {
        items.forEach(item => {
            let leaf = leafFrom(key(item.id!))!;
            let { x, y, w, h } = item;
            leaf.geometry = { x, y, w, h };
        });

        write();
    });
};

let newItem = (title: string, className?: string): GridItemHTMLElement => {
    let item = document.createElement("div");
    item.classList.add("grid-stack-item");
    if (className) item.classList.add(className);

    let content = document.createElement("div");
    content.classList.add("grid-stack-item-content");

    let header = document.createElement("div");
    header.classList.add("widget-header");
    header.innerText = title;

    let body = document.createElement("div");
    body.classList.add("widget-body");

    content.append(header, body);
    item.append(content);
    return item;
};

let activateItem = (id: string, item: GridItemHTMLElement, grid: GridStack, defaults: GridStackWidget) => {
    grid.el.append(item);

    // need to do it this way opposed to .addWidget()
    // to register drag area via "handle" option during init, further down
    grid.makeWidget(item, { ...defaults, id });
};

let findItem = (keystring: KeyString, grid: GridStack): GridItemHTMLElement | undefined => {
    // can not make use of Utils.find() since it holds stale DOM references during drag
    let el = grid.el.querySelector(`[gs-id="${CSS.escape(keystring)}"]`);
    return (el ?? undefined) as GridItemHTMLElement | undefined;
};

let cacheGeometry = (item: GridItemHTMLElement, leaf: LeafNode) => {
    if (item.gridstackNode === undefined) return;
    let { x, y, w, h } = item.gridstackNode;
    leaf.geometry = { x, y, w, h };
};

let revealItem = (item: GridItemHTMLElement, leaf: LeafNode, grid: GridStack) => {
    grid.makeWidget(item, { ...leaf.geometry, id: keystr(leaf) });
    item.classList.remove("hidden");
};

let hideItem = (item: GridItemHTMLElement, grid: GridStack) => {
    grid.removeWidget(item, false);
    item.classList.add("hidden");
};

let syncVis = (item: GridItemHTMLElement, leaf: LeafNode, grid: GridStack) => {
    if (leaf.visible && item.classList.contains("hidden")) {
        revealItem(item, leaf, grid);
        return;
    }

    if (!leaf.visible && !item.classList.contains("hidden")) {
        hideItem(item, grid);
    }
};

export let updateVisibility = (leafs: LeafNode[]) => {
    let tuples = leafs
        // insert new widgets bottom-right first, top-left last
        // don't push residing widgets all the way down
        .sort((a, b) => (b.geometry?.y ?? 0) - (a.geometry?.y ?? 0)
            || (b.geometry?.x ?? 0) - (a.geometry?.x ?? 0))
        .map((leaf): [ GridItemHTMLElement | undefined, LeafNode ] => [ findItem(keystr(leaf), grid), leaf ])
        .filter((tuple): tuple is [ GridItemHTMLElement, LeafNode ] => tuple[0] !== undefined);

    tuples.forEach(([ item, leaf ]) => cacheGeometry(item, leaf));
    tuples.forEach(([ item, leaf ]) => syncVis(item, leaf, grid));
};

export let remove = (k: ccb.AppletKey) => {
    let item = findItem(keystr(k), grid);
    if (!item) return;
    grid.removeWidget(item);
};

export let newTemplateItem = (leaf: LeafNode, defaults: GridStackWidget | undefined): HTMLElement => {
    let keystring = keystr(leaf);
    let item = findItem(keystring, grid);
    if (!item) {
        let breadcrumb = [ ...leaf.group, leaf.name ].reverse().join(" — ");
        item = newItem(breadcrumb, "applet");
        activateItem(keystring, item, grid, {
            ...(defaults ?? { w: 5, h: 4 }),
            ...leaf.geometry,
        });
    }

    let host = item.querySelector(".widget-body") as HTMLElement;
    host.className = "widget-body";
    host.replaceChildren();

    cacheGeometry(item, leaf);
    syncVis(item, leaf, grid);

    return host;
};