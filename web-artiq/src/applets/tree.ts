import type * as ccb from "./ccb";
import * as dbio from "./dbio";

export type PolicyName = "create" | "visible";
let policies = [ undefined, true, false ]; // undefined represents policy inheritance from parent
export type Policy = typeof policies[number];
export type DefinitePolicy = boolean;

export let nextPolicy = (p: Policy): Policy => policies[ (policies.indexOf(p) + 1) % policies.length];

type Coord = number | undefined;
// FIXME: this is derived from GridStack
type Geometry = { x: Coord, y: Coord, w: Coord, h: Coord };
export type Visible = boolean;

type BaseNode = {
    name: ccb.GroupEl | ccb.Name,
    policy: Record<PolicyName, Policy>,
    children: Node[],
}

type GroupNode = BaseNode & {
    name: ccb.GroupEl,
    expanded: boolean,
};

type RootNode = GroupNode & {
    name: "root",
    policy: Record<PolicyName, DefinitePolicy>,
};

export type LeafNode = BaseNode & ccb.CreateArgs & {
    visible: Visible,
    geometry?: Geometry,
    children: [];
};

export type Node = GroupNode | LeafNode;

export let isRoot = (n: Node): n is RootNode => n === root;
export let isLeaf = (n: Node): n is LeafNode => "visible" in n;
export let isGroup = (n: Node): n is GroupNode => !isLeaf(n);

type WalkStep<T> = (n: Node | undefined, acc: T) => T;

export let walk = <T>(path: ccb.Group, step: WalkStep<T>, seed: T, create?: boolean): T => path
    .reduce(([ sibs, acc ], name): [ Node[], T ] => {
        let group = sibs.find((n: Node) => isGroup(n) && n.name === name);
        if (create && !group)
            sibs.push(group = { name, policy: { create: undefined, visible: undefined }, expanded: false, children: [] });

        return [ group?.children ?? [], step(group, acc) ];
    }, [ root.children, seed ] as [ Node[], T ])[1];

let pave = <T>(path: ccb.Group, step: (n: Node, acc: T) => T, seed: T): T => walk(path, step as WalkStep<T>, seed, true);

export let groupFrom = (path: ccb.Group): GroupNode | undefined => walk<GroupNode | undefined>(path, n => n && isGroup(n) ? n : undefined, root);

export let leafFrom = (k: ccb.AppletKey): LeafNode | undefined => groupFrom(k.group)?.children
    .find((n): n is LeafNode => n.name === k.name && isLeaf(n));

export let newLeaf = (args: ccb.CreateArgs): LeafNode => {
    let sibs = pave(args.group, n => n.children, root.children);
    let leaf: LeafNode = { ...args, visible: false, policy: { create: undefined, visible: undefined }, children: [] };
    sibs.push(leaf);
    return leaf;
};

type TraverseStep<T> = (n: Node, acc: T) => T;

export let traverse = <T>(node: Node, step: TraverseStep<T>, acc: T): void => {
    let next = step(node, acc);
    node.children.forEach(c => traverse(c, step, next));
};

export let leafs = (node: Node): LeafNode[] => {
    let all: LeafNode[] = [];
    traverse(node, n => isLeaf(n) && all.push(n), undefined);
    return all;
};

// FIXME: this does not stop traversal on find
export let parent = (node: Node): Node | undefined => {
    let found: Node | undefined;

    traverse<Node | undefined>(root, (curr, p) => {
        if (curr === node) found = p;
        return curr;
    }, undefined);

    return found;
};

export let detach = (node: Node): Node => {
    let p = parent(node);
    if (!p) return node;

    let i = p.children.indexOf(node);
    p.children.splice(i, 1);
    return node;
};

export let root: RootNode = dbio.read<RootNode>() ?? { name: "root", policy: { create: true, visible: false }, expanded: true, children: [] };
export let write: () => void = () => dbio.write<RootNode>(root);