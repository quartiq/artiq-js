import type * as ccb from "./ccb";
import type {
  PolicyKey,
  DefinitePolicyValue,
  Node,
  LeafNode,
} from "./tree.svelte";
import { isLeaf, walk, branchFrom, leafFrom, root } from "./tree.svelte";

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
  const node = k.name === null ? branchFrom(k.group) : leafFrom(k);
  if (!node) return [];

  const all: LeafNode[] = [];

  const collect = (ncurr: Node, inherited: DefinitePolicyValue): void => {
    const allowed = ncurr.policy[name] ?? inherited;

    if (isLeaf(ncurr)) {
      if (allowed) all.push(ncurr);
      return;
    }

    ncurr.children.forEach((child) => collect(child, allowed));
  };

  collect(node, inherited(name, k.group));
  return all;
};
