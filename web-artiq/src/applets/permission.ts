import { PolicyName, DefinitePolicy, Node, LeafNode, isLeaf, walk, traverse, groupFrom, leafFrom, root } from "./tree";
import type * as ccb from "./ccb";

let inherited = (name: PolicyName, path: ccb.Group): DefinitePolicy =>
    walk(path, (n, acc) => n?.policy[name] ?? acc, root.policy[name]);

export let granted = (name: PolicyName, k: ccb.AppletKey): boolean => {
    let leaf = leafFrom(k);
    return leaf?.policy[name] ?? inherited(name, k.group);
};

export let leafsByPolicy = (name: PolicyName, k: ccb.TargetKey): LeafNode[] => {
    let node: Node | undefined = k.name === null ? groupFrom(k.group) : leafFrom(k);
    if (!node) return [];

    let all: LeafNode[] = [];

    traverse(node, (n, inherited) => {
        let granted = n.policy[name] ?? inherited;
        if (granted && isLeaf(n)) all.push(n);
        return granted;
    }, inherited(name, k.group));

    return all;
};