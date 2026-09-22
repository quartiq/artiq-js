import type * as ccb from "./ccb";
import * as dbio from "./dbio";

export type PolicyName = "create" | "visible";
const policies = [undefined, true, false]; // undefined represents policy inheritance from parent
export type Policy = (typeof policies)[number];
export type DefinitePolicy = boolean;

export const nextPolicy = (p: Policy): Policy =>
  policies[(policies.indexOf(p) + 1) % policies.length];

type Coord = number | undefined;
// FIXME: this is derived from GridStack
type Geometry = { x: Coord; y: Coord; w: Coord; h: Coord };
export type Visible = boolean;

type BaseNode = {
  name: ccb.GroupEl | ccb.Name;
  policy: Record<PolicyName, Policy>;
  children: Node[];
};

type GroupNode = BaseNode & {
  name: ccb.GroupEl;
  expanded: boolean;
};

type RootNode = GroupNode & {
  name: "root";
  policy: Record<PolicyName, DefinitePolicy>;
};

export type LeafNode = BaseNode &
  ccb.CreateArgs & {
    visible: Visible;
    geometry?: Geometry;
    children: [];
  };

export type Node = GroupNode | LeafNode;

export const isRoot = (n: Node): n is RootNode => n === root;
export const isLeaf = (n: Node): n is LeafNode => "visible" in n;
export const isGroup = (n: Node): n is GroupNode => !isLeaf(n);

type WalkStep<T> = (n: Node | undefined, acc: T) => T;

export const walk = <T>(
  path: ccb.Group,
  step: WalkStep<T>,
  seed: T,
  create?: boolean,
): T =>
  path.reduce(
    ([sibs, acc], name): [Node[], T] => {
      let group = sibs.find((n: Node) => isGroup(n) && n.name === name);
      if (create && !group)
        sibs.push(
          (group = {
            name,
            policy: { create: undefined, visible: undefined },
            expanded: false,
            children: [],
          }),
        );

      return [group?.children ?? [], step(group, acc)];
    },
    [root.children, seed] as [Node[], T],
  )[1];

const pave = <T>(path: ccb.Group, step: (n: Node, acc: T) => T, seed: T): T =>
  walk(path, step as WalkStep<T>, seed, true);

export const groupFrom = (path: ccb.Group): GroupNode | undefined =>
  walk<GroupNode | undefined>(
    path,
    (n) => (n && isGroup(n) ? n : undefined),
    root,
  );

export const leafFrom = (k: ccb.AppletKey): LeafNode | undefined =>
  groupFrom(k.group)?.children.find(
    (n): n is LeafNode => n.name === k.name && isLeaf(n),
  );

export const newLeaf = (args: ccb.CreateArgs): LeafNode => {
  const sibs = pave(args.group, (n) => n.children, root.children);
  const leaf: LeafNode = {
    ...args,
    visible: false,
    policy: { create: undefined, visible: undefined },
    children: [],
  };
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

export const leafs = (node: Node): LeafNode[] => {
  const all: LeafNode[] = [];
  traverse(node, (n) => isLeaf(n) && all.push(n), undefined);
  return all;
};

// FIXME: this does not stop traversal on find
export const parent = (node: Node): Node | undefined => {
  let found: Node | undefined;

  traverse<Node | undefined>(
    root,
    (curr, p) => {
      if (curr === node) found = p;
      return curr;
    },
    undefined,
  );

  return found;
};

export const detach = (node: Node): Node => {
  const p = parent(node);
  if (!p) return node;

  const i = p.children.indexOf(node);
  p.children.splice(i, 1);
  return node;
};

export const root: RootNode = dbio.read<RootNode>() ?? {
  name: "root",
  policy: { create: true, visible: false },
  expanded: true,
  children: [],
};
export const write: () => void = () => dbio.write<RootNode>(root);
