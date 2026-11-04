import type * as ccb from "./ccb";
import type {
  PolicyKey,
  DefinitePolicyValue,
  Node,
  LeafNode,
} from "./tree.svelte";
import {
  isLeaf,
  walk,
  traverse,
  branchFrom,
  leafFrom,
  root,
} from "./tree.svelte";

const inherited = (name: PolicyKey, path: ccb.Group): DefinitePolicyValue =>
  walk(path, (n, acc) => n?.policy[name] ?? acc, root.policy[name]);

export const granted = (name: PolicyKey, k: ccb.AppletKey): boolean => {
  const leaf = leafFrom(k);
  return leaf?.policy[name] ?? inherited(name, k.group);
};

export const leavesByPolicy = (
  name: PolicyKey,
  k: ccb.TargetKey,
): LeafNode[] => {
  const node: Node | undefined =
    k.name === null ? branchFrom(k.group) : leafFrom(k);
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
