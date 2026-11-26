import { tick } from "svelte";
import { expand, type LeafNode } from "./tree.svelte";

const state = $state<{ selected?: LeafNode }>({});
export const isSelected = (leaf: LeafNode) => state.selected === leaf;

const gridItems = new Map<LeafNode, HTMLElement>();

export const registerItem = (leaf: LeafNode, item: HTMLElement) => {
  gridItems.set(leaf, item);
  return () => gridItems.delete(leaf);
};

export const selectItem = (leaf: LeafNode) => {
  state.selected = leaf;
  gridItems.get(leaf)?.scrollIntoView({ block: "nearest" });
};

const managerRows = new Map<LeafNode, HTMLElement>();

export const registerRow = (leaf: LeafNode, row: HTMLElement) => {
  managerRows.set(leaf, row);
  return () => managerRows.delete(leaf);
};

export const selectRow = async (leaf: LeafNode) => {
  expand(leaf);
  await tick();

  state.selected = leaf;
  managerRows.get(leaf)?.scrollIntoView({ block: "nearest" });
};
