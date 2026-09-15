import {
    createTable, getCoreRowModel, ExpandedState, getExpandedRowModel, TableState, Row, Cell,
} from "@tanstack/table-core";

import { PolicyName, Policy, nextPolicy, Visible, Node, LeafNode, isRoot, isLeaf, isGroup, leafFrom, newLeaf, leafs, parent, detach, root, write } from "./tree";
import * as ccb from "./ccb";
import * as editor from "./editor";

type Handler = (leafs: LeafNode[]) => void;
type HandleFuncs = {
    updateVisibility: Handler,
    remove: Handler,
};

let handlers: HandleFuncs;
let host: HTMLElement;
let table: HTMLTableElement;

export let handleFuncs = (funcs: HandleFuncs) => handlers = funcs;

let dom = () => {
    let el = document.createElement("div");
    el.classList.add("sidebar", "collapsed");

    host = document.createElement("div");
    host.classList.add("manager");

    table = document.createElement("table");
    host.append(table);

    let handle = document.createElement("div");
    handle.classList.add("handle");
    handle.innerText = "⚙️";
    handle.addEventListener("click", () => el.classList.toggle("collapsed"));

    el.append(host);
    el.append(handle);
    document.body.append(el);
};

export let init = (): LeafNode[] => {
    dom();
    host.append(editor.init());
    render();
    return leafs(root);
};

let expandedFrom = (nodes: Node[], parentId?: string, result: Record<string, boolean> = {}): ExpandedState => {
    nodes.forEach((n, i) => {
        if (isLeaf(n)) return;

        let id = parentId === undefined ? `${i}` : `${parentId}.${i}`;
        result[id] = n.expanded;
        expandedFrom(n.children, id, result);
    });

    return result;
};

export let setVisible = (node: Node, visible: boolean): void => leafs(node).forEach(l => l.visible = visible);
export let setVisibleAll = (leafs: LeafNode[], visible: boolean): void => leafs.forEach(l => l.visible = visible);

export let upsert = (args: ccb.CreateArgs): LeafNode =>
    Object.assign(leafFrom(args) ?? newLeaf(args), args);

export let move = (args: ccb.CreateArgs, old: LeafNode): LeafNode =>
    Object.assign(leafFrom(args) ?? newLeaf(args), detach(old), args);

let state: TableState = {
    columnVisibility: {},
    columnOrder: [],
    columnPinning: { left: [], right: [] },
    rowPinning: { top: [], bottom: [] },
    columnFilters: [],
    globalFilter: undefined,
    sorting: [],
    expanded: {},
    grouping: [],
    columnSizing: {},
    columnSizingInfo: {
        startOffset: null,
        startSize: null,
        deltaOffset: null,
        deltaPercentage: null,
        isResizingColumn: false,
        columnSizingStart: [],
    },
    pagination: {
        pageIndex: 0,
        pageSize: 10,
    },
    rowSelection: {},
};

let agents = {
    human: { icon: "🧑", bg: "mistyrose" }, // invoke UI actions now
    machine: { icon: "🤖", bg: "aliceblue" }, // allow or deny future external CCB actions
};

let createModel = () => createTable<Node>({
    data: [ root ],
    columns: [
        { accessorKey: "name", header: "Name" },
        {
            header: agents.human.icon,
            meta: { bg: agents.human.bg },
            columns: [
                { header: "🌱", meta: { bg: agents.human.bg } },
                { accessorKey: "visible", header: "👁️", meta: { bg: agents.human.bg } },
                { header: "🗑️", meta: { bg: agents.human.bg } },
            ],
        },
        {
            header: agents.machine.icon,
            meta: { bg: agents.machine.bg },
            columns: [
                { accessorFn: row => row.policy?.create, header: "🌱", meta: { bg: agents.machine.bg } },
                { accessorFn: row => row.policy?.visible, header: "👁️", meta: { bg: agents.machine.bg } },
            ],
        },
    ],
    state: { ...state, expanded: expandedFrom([ root ]) },
    onStateChange: updater => {
        state = typeof updater === "function" ? updater(state) : updater;
        refresh();
    },
    renderFallbackValue: null,
    getSubRows: r => r.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
});

let policyCellHandler = (name: PolicyName, node: Node, p: Policy) => {
    let updateCheckbox = (p: Policy) => {
        input.indeterminate = p === undefined;
        input.checked = p === true;
    };

    let input = document.createElement("input");
    input.type = "checkbox";
    updateCheckbox(p);

    input.addEventListener("change", () => {
        let next = nextPolicy(p);
        if (node === root) next = !p;
        node.policy[name] = next;
        refresh();
    })

    return input;
};

let cellHandlers = [
    (td: HTMLTableCellElement, row: Row<Node>, cell: Cell<Node, unknown>) => {
        let node = row.original;

        if (row.getCanExpand() && isGroup(node)) {
            let btn = document.createElement("span");
            btn.classList.add("button");
            btn.textContent = row.getIsExpanded() ? "👇" : "👉";
            btn.addEventListener("click", () => {
                node.expanded = !row.getIsExpanded();
                row.toggleExpanded(); // invokes onStateChange()
            });
            td.append(btn);
        }

        if (isLeaf(node)) {
            td.classList.add("button");
            td.addEventListener("click", () => editor.open(node));
        }

        td.style.paddingLeft = `${row.depth * 16}px`;
        td.append(cell.getValue() as ccb.Name | ccb.GroupEl);
    },

    (td: HTMLTableCellElement, row: Row<Node>) => {
        if (!isGroup(row.original)) return;

        let btn = document.createElement("button");
        btn.textContent = "➕";
        btn.addEventListener("click", () => {
            let group = (r: Row<Node>): ccb.Group => {
                let p = r.getParentRow();
                return p ? [ ...group(p), r.original.name ] : [];
            };

            editor.open({ group: group(row) });
        });

        td.append(btn);
    },

    (td: HTMLTableCellElement, row: Row<Node>, cell: Cell<Node, unknown>) => {
        if (isLeaf(row.original)) {
            let input = document.createElement("input");
            input.type = "checkbox";
            input.checked = cell.getValue() as Visible;

            let leaf = row.original;
            input.addEventListener("change", () => {
                setVisible(leaf, input.checked);
                handlers.updateVisibility([ leaf ]);
                refresh();
            });

            td.append(input);
            return;
        }

        [ true, false ].forEach(visible => {
            let btn = document.createElement("button");
            btn.innerText = visible ? "🟢" : "🔴";
            btn.addEventListener("click", () => {
                setVisible(row.original, visible);
                handlers.updateVisibility(leafs(row.original));
                refresh();
            });

            td.append(btn);
        });
    },

    (td: HTMLTableCellElement, row: Row<Node>) => {
        if (isRoot(row.original)) return;

        let btn = document.createElement("button");
        btn.innerText = "➖";
        btn.addEventListener("click", () => {
            detach(row.original);
            handlers.remove(leafs(row.original));
            refresh();
        });

        td.append(btn);
    },

    (td: HTMLTableCellElement, row: Row<Node>, cell: Cell<Node, unknown>) => {
        let input = policyCellHandler("create", row.original, cell.getValue() as Policy);
        td.append(input);
    },

    (td: HTMLTableCellElement, row: Row<Node>, cell: Cell<Node, unknown>) => {
        let input = policyCellHandler("visible", row.original, cell.getValue() as Policy);
        td.append(input);
    },
];

let render = () => {
    let model = createModel();

    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");

    model.getHeaderGroups().forEach(hg => {
        let hr = document.createElement("tr");
        hg.headers.forEach(h => {
            let th = document.createElement("th");
            let meta = h.column.columnDef.meta as { bg?: string } | undefined;
            th.style.backgroundColor = meta?.bg ?? "";
            th.colSpan = h.colSpan;
            if (!h.isPlaceholder) th.textContent = String(h.column.columnDef.header ?? "");
            hr.append(th);
        });
        thead.append(hr);
    });

    model.getRowModel().rows.forEach(r => {
        let tr = document.createElement("tr");

        r.getVisibleCells().forEach((c, i) => {
            let td = document.createElement("td");
            let meta = c.column.columnDef.meta as { bg?: string } | undefined;
            td.style.backgroundColor = meta?.bg ?? "";
            cellHandlers[i](td, r, c);
            tr.append(td);
        });

        tbody.append(tr);
    });

    table.replaceChildren(thead, tbody);
};

export let refresh = () => {
    write();
    render();
};