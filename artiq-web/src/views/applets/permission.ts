import {
  PolicyName,
  DefinitePolicy,
  Node,
  LeafNode,
  isLeaf,
  walk,
  traverse,
  groupFrom,
  leafFrom,
  root,
} from "./tree";
import type * as ccb from "./ccb";

const inherited = (name: PolicyName, path: ccb.Group): DefinitePolicy =>
  walk(path, (n, acc) => n?.policy[name] ?? acc, root.policy[name]);

export const granted = (name: PolicyName, k: ccb.AppletKey): boolean => {
  const leaf = leafFrom(k);
  return leaf?.policy[name] ?? inherited(name, k.group);
};

export const leafsByPolicy = (
  name: PolicyName,
  k: ccb.TargetKey,
): LeafNode[] => {
  const node: Node | undefined =
    k.name === null ? groupFrom(k.group) : leafFrom(k);
  if (!node) return [];

  const all: LeafNode[] = [];

  traverse(
    node,
    (n, inherited) => {
      const granted = n.policy[name] ?? inherited;
      if (granted && isLeaf(n)) all.push(n);
      return granted;
    },
    inherited(name, k.group),
  );

  return all;
};
