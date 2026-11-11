import type { LayoutItem } from "@appulsauce/svelte-grid";

import * as dbio from "./dbio";
import type * as ccb from "./ccb";

export type PolicyKey = "allowCreation" | "allowVisCtrl";
export type DefinitePolicyValue = boolean;
export type PolicyValue = DefinitePolicyValue | undefined; // undefined represents policy inheritance from parent

type Visible = boolean;

type BaseNode = {
  name: ccb.GroupEl | ccb.Name;
  policy: Record<PolicyKey, PolicyValue>;
  children: Node[];
};

export type BranchNode = BaseNode & {
  name: ccb.GroupEl;
  expanded: boolean;
};

type RootNode = BranchNode & {
  name: "root";
  policy: Record<PolicyKey, DefinitePolicyValue>;
};

export type LeafNode = BaseNode &
  Omit<ccb.CreateArgs, "group"> & {
    visible: Visible;
    geometry?: Pick<LayoutItem, "x" | "y" | "w" | "h">;
    children: [];
  };

export type Node = BranchNode | LeafNode;

export const isRoot = (n: Node): n is RootNode => n === root;
export const isLeaf = (n: Node): n is LeafNode => "visible" in n;
const isBranch = (n: Node): n is BranchNode => !isLeaf(n);

type WalkStep<T> = (n: Node | undefined, acc: T) => T;

export const walk = <T>(
  group: ccb.Group,
  step: WalkStep<T>,
  seed: T,
  create?: boolean,
): T =>
  group.reduce(
    ([sibs, acc], name): [Node[], T] => {
      let branch = sibs.find((n: Node) => isBranch(n) && n.name === name);
      if (create && !branch) {
        const created = $state<BranchNode>({
          name,
          policy: { allowCreation: undefined, allowVisCtrl: undefined },
          expanded: false,
          children: [],
        });

        sibs.push(created);
        branch = created;
      }

      return [branch?.children ?? [], step(branch, acc)];
    },
    [root.children, seed] as [Node[], T],
  )[1];

const pave = <T>(group: ccb.Group, step: (n: Node, acc: T) => T, seed: T): T =>
  walk(group, step as WalkStep<T>, seed, true);

export const branchFrom = (group: ccb.Group): BranchNode | undefined =>
  walk<BranchNode | undefined>(
    group,
    (n) => (n && isBranch(n) ? n : undefined),
    root,
  );

export const newBranch = (group: ccb.Group): void => {
  pave(group, (n) => n.children, root.children);
};

export const leafFrom = (k: ccb.AppletKey): LeafNode | undefined =>
  branchFrom(k.group)?.children.find(
    (n): n is LeafNode => n.name === k.name && isLeaf(n),
  );

export const newLeaf = ({ group, ...args }: ccb.CreateArgs): LeafNode => {
  const sibs = pave(group, (n) => n.children, root.children);
  const leaf = $state<LeafNode>({
    ...args,
    visible: false,
    policy: { allowCreation: undefined, allowVisCtrl: undefined },
    children: [],
  });
  sibs.push(leaf);
  return leaf;
};

type TraverseStep<T> = (n: Node, acc: T) => T;

export const traverse = <T>(
  node: Node,
  step: TraverseStep<T>,
  acc: T,
): void => {
  const next = step(node, acc);
  node.children.forEach((c) => traverse(c, step, next));
};

export const leaves = (node: Node): { leaf: LeafNode; path: string[] }[] => {
  const all: { leaf: LeafNode; path: string[] }[] = [];

  traverse(
    node,
    (ncurr, pcurr: string[]) => {
      const path = isRoot(ncurr) ? pcurr : [...pcurr, ncurr.name];

      if (isLeaf(ncurr)) all.push({ leaf: ncurr, path });
      return path;
    },
    [],
  );

  return all;
};

const find = (node: Node, callback: (n: Node) => boolean): Node | undefined => {
  if (callback(node)) return node;

  for (const child of node.children) {
    const found = find(child, callback);
    if (found) return found;
  }
};

export const parent = (node: Node): Node | undefined =>
  find(root, (curr) => curr.children.includes(node));

export const contains = (subtree: Node, node: Node): boolean =>
  find(subtree, (curr) => curr === node) !== undefined;

export const nameTaken = (
  sibs: Node[],
  node: Node,
  name = node.name,
): boolean =>
  sibs.some(
    (curr) =>
      curr !== node && curr.name === name && isLeaf(curr) === isLeaf(node),
  );

export const detach = (node: Node): Node => {
  const p = parent(node);
  if (!p) return node;

  const i = p.children.indexOf(node);
  p.children.splice(i, 1);
  return node;
};

export const root = $state<RootNode>(
  dbio.read<RootNode>() ?? {
    name: "root",
    policy: { allowCreation: true, allowVisCtrl: false },
    expanded: true,
    children: [],
  },
);

export const write: () => void = () => dbio.write<RootNode>(root);
