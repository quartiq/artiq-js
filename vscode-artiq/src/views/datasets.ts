// TODO: clarify and distinguish between keypath, setpath and leafpath
// TODO: one day, let this view derive directly from web-artiq's dataset view

import * as vscode from "vscode";
import * as pyon from "js-sipyco/pyon";
import * as pyonutils from "js-sipyco/pyonutils";
import * as sync_struct from "js-sipyco/sync_struct";
import * as pc_rpc from "js-sipyco/pc_rpc";

import { getByPath, setByPath, splitOnLast, clamp, arrayFrom } from "../utils.js";
import * as units from "../units.js";

let provider: DatasetsProvider;
export let view: vscode.TreeView<string>;

type Keypath = string;
type Metadata = { unit: string, scale: number, precision: number };
type Dataset = [ persist: boolean, value: any, metadata: Metadata ];
type Datasets = pyon.TaggedDict<Keypath, Dataset>;

type Store = sync_struct.Store & { struct: Datasets };
export let store: Store = { struct: pyonutils.create("dict", [[]]) as any as Datasets }; // FIXME: bad typing

type InputProperty = { path: any[], desc: string, test: (s: string) => boolean, parse: (s: string) => any };
let inputProps: Record<string, InputProperty> = {
    // TODO: add tooltip messages to explain, how each metadata applies to the database
    Value: { path: [1], desc: "PYON v2 JSON", test: (s: string) => pyonutils.validate(s, pyon.parse), parse: pyon.parse },
    Unit: { path: [2, "unit"], desc: "string", test: (s: string) => typeof s === "string", parse: (s: string) => s },
    Scale: { path: [2, "scale"], desc: "number", test: (s: string) => /^-?\d+(\.\d+)?$/.test(s), parse: (s: string) => Number(s) },
    // see: https://numpy.org/doc/stable/reference/generated/numpy.format_float_positional.html
    Precision: { path: [2, "precision"], desc: "non-negative integer", test: (s: string) => /^(0|[1-9][0-9]*)$/.test(s), parse: (s: string) => Number(s) },
};

let name = (keypath: string): string => keypath.split(".").pop()!;

// makes no implicit statement regarding overflow one way or the other
let startsWith = (arr: string[], prefix: string[]) => arr
    .slice(0, prefix.length)
    .every((val, index) => val === prefix[index]);

let findChildren = (keypaths: string[], prefix: string[], depth?: number): string[][] => keypaths
    .map(kp => kp.split("."))
    .filter(keys => startsWith(keys, prefix))
    .filter(keys => keys.length >= prefix.length + (depth ?? 0));

let isNode = (keypath: string): boolean => {
    let keypaths = arrayFrom(store.struct, "keys");
    return findChildren(keypaths, keypath.split(".")).length > 0;
};

let closestParent = (keypath: string | undefined): string | undefined => {
    let keypaths = arrayFrom(store.struct, "keys");
    if (!keypath || keypaths.length === 0) { return undefined; }

    let ancestors = keypaths.filter(path => path !== keypath); // exclude self
    let target = keypath.split(".");

    while (true) {
        target.pop();
        let descendants = findChildren(ancestors, target);
        if (descendants.length > 0) { break; }
    }

    return target.join(".");
};

let submit = async (setpath: string, set?: Dataset) => await pc_rpc.from({
    masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
    targetName: "dataset_db",
    methodName: "set",
    kwargs: { key: setpath, ...set },
    onError: err => vscode.window.showErrorMessage(`dataset_db set: ${err}`),
});

let applyScale = (value: any, meta: Metadata, inverse?: boolean): any => {
    let scale = meta.scale ?? units.scale(meta.unit); // see: m-labs/artiq/tools:scale_from_metadata
    if (!Number.isFinite(scale)) { return value; }

    if (inverse) { return value / scale; }
    return value * scale;
};

let applyPrecision = (value: any, precision: number): any => {
    if (!Number.isFinite(precision)) { return value; }
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toPrecision#exceptions
    return value.toPrecision(clamp(precision, 1, 100));
};

let fmtNumber = (set: Dataset): string => {
    let v = applyScale(set[1], set[2], true);
    v = applyPrecision(v, set[2].precision);
    return `${v}${set[2].unit ? " " + set[2].unit : ""}`;
};

let fmt = (set: Dataset, preview?: pyon.Encoder) => {
    if (Number.isFinite(set[1])) { return fmtNumber(set); }
    if (pyon.isTypeTaggedObject(set[1])) { return preview ? preview(set[1]) : pyon.fmt(set[1]); }
    return set[1];
};

class DatasetTreeItem extends vscode.TreeItem {
    constructor(
        keypath: string,
    ) {
        super(name(keypath));

        let set = store.struct.get(keypath);
        if (set) {
            this.description = String(fmt(set, pyon.preview));
            this.contextValue = "dataset";
            this.checkboxState = Number(set[0]);
            this.tooltip = "Checkbox: Make dataset persist ARTIQ restart";
            this.command = {
                command: "artiq.editDataset",
                title: "",
                arguments: [keypath, "Value"],
            };
        }

        if (isNode(keypath)) {
            this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            return;
        }

        // only metadata nodes (= leafs) left at this point
        let propname;
        [keypath, propname] = splitOnLast(keypath, ".");
        this.description = String(getByPath(store.struct.get(keypath), inputProps[propname!].path));
        let color = new vscode.ThemeColor("symbolIcon.variableForeground");
        this.iconPath = new vscode.ThemeIcon("edit", color);
        this.command = {
            command: "artiq.editDataset",
            title: "",
            arguments: [keypath, propname],
        };
    }
}

class DatasetsProvider implements vscode.TreeDataProvider<string> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
    public refresh(keypath: string | undefined): void {
        // tree model assumes the existence of a node, so
        // we update through "getChildren" on closest existing parent node
        this._onDidChangeTreeData.fire(closestParent(keypath));
        vscode.window.showInformationMessage("Updated Datasets");
    }

    constructor() {}

    getTreeItem(keypath: string): vscode.TreeItem {
        return new DatasetTreeItem(keypath);
    }

    getParent(keypath: string): string {
        return keypath.split(".").slice(0, -1).join(".");
    }

    getChildren(keypath?: string): string[] {
        let parentKeys = keypath ? keypath.split(".") : [];
        let keypaths = arrayFrom(store.struct, "keys");
        let dups = findChildren(keypaths, parentKeys, 1)
            .map(keys => keys.slice(0, parentKeys.length + 1).join("."))
            .sort((a, b) => name(a).localeCompare(name(b)));

        let leafs: string[] = [];
        if (keypath && store.struct.has(keypath)) {
            leafs = Object.keys(inputProps)
                .filter(name => name !== "Value")
                .map(name => [keypath, name].join("."));
        }

        // create Set() instance to erase duplicates
        return [...leafs, ...new Set(dups)];
    }
}

export let init = async () => {
    provider = new DatasetsProvider();
    view = vscode.window.createTreeView("datasets", {
        treeDataProvider: provider,
        manageCheckboxStateManually: true, // prevent coupling of checkbox state throughout the whole tree path
    });

    view.onDidChangeCheckboxState(ev => ev.items.forEach(item => {
        let [keypath, checked] = item;
        let set = store.struct.get(keypath);
        set[0] = Boolean(checked);
        submit(keypath, set);
    }));

    store = await sync_struct.from({
        masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
        notifierName: "datasets",
        onReceive: (_: sync_struct.Store, mod: sync_struct.Mod) => {
            if (mod.action === "init") {
                provider.refresh(undefined);
                return;
            }

            let keypath = mod.path[0] ?? mod.key;
            provider.refresh(keypath);
            if (mod.action === "setitem" && mod.path[0] === undefined) {
                view.reveal(keypath, { focus: true, expand: true });
            }
        },
    });
};

export let create = async () => {
    let path = await vscode.window.showInputBox({ prompt: "Path:" });
    if (path) { submit(path); }
};

export let move = async (keypath: string) => {
    let newPath = await vscode.window.showInputBox({ prompt: "New path:", value: keypath });
    if (newPath && newPath !== keypath) {
        let set = store.struct.get(keypath);
        pc_rpc.from({
            masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
            targetName: "dataset_db",
            methodName: "delete",
            kwargs: { key: keypath },
            onError: err => vscode.window.showErrorMessage(`dataset_db delete: ${err}`),
        });
        submit(newPath, set);
    }
};

// TODO: Create config bool for confirmation dialog on/off
export let del = async (keypath: string) => {
    let result = await vscode.window.showWarningMessage(
        `Do you really want to delete dataset "${keypath}"?`,
        { modal: true },
        "Delete"
    );
    if (result === "Delete") {
        pc_rpc.from({
            masterHostname: vscode.workspace.getConfiguration("artiq").get("host")!,
            targetName: "dataset_db",
            methodName: "delete",
            kwargs: { key: keypath },
            onError: err => vscode.window.showErrorMessage(`dataset_db delete: ${err}`),
        });
    }
};

// see: m-labs/artiq/dashboard/datasets:CreateEditDialog.accept
export let edit = async (keypath: string, propname: string) => {
    let set = structuredClone(store.struct.get(keypath));
    set[1] = applyScale(set[1], set[2], true);

    let prop = inputProps[propname];
    let validateInput = (s: string) => {
        if (s === "") { return null; }
        if (prop.test(s)) { return null; }
        return `Please enter a valid ${prop.desc}`;
    };

    let value = propname === "Value" ? fmt(set) : getByPath(set, prop.path);
    let newValue = await vscode.window.showInputBox({ prompt: `Edit ${propname}:`, validateInput, value });
    if (newValue === undefined) { return; }

    newValue = newValue === "" ? undefined : prop.parse(newValue);
    if (newValue === value) { return; }

    setByPath(set, prop.path, newValue);
    set[1] = applyScale(set[1], set[2]);
    submit(keypath, set);
};
