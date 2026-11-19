import {
  isRoot,
  isLeaf,
  parent,
  contains,
  nameTaken,
  type Node as TreeNode,
  type BranchNode,
} from "../tree.svelte";

let dragged = $state<TreeNode>();
export const state = $state<{ target?: TreeNode }>({});
const src = $derived(dragged ? parent(dragged) : undefined);

const droppable = (dest: TreeNode): dest is BranchNode => {
  return (
    !!dragged &&
    !isRoot(dragged) &&
    !!src &&
    !isLeaf(dest) &&
    src !== dest &&
    !contains(dragged, dest) &&
    !nameTaken(dest.children, dragged)
  );
};

export const end = () => {
  dragged = undefined;
  state.target = undefined;
};

export const start = (ev: DragEvent, node: TreeNode) => {
  if (isRoot(node) || !ev.dataTransfer) return;

  dragged = node;
  ev.dataTransfer.effectAllowed = "move";
  ev.dataTransfer.setData("text/plain", node.name);
};

export const over = (ev: DragEvent, dest: TreeNode) => {
  const allowed = droppable(dest);
  state.target = allowed ? dest : undefined;

  if (ev.dataTransfer) ev.dataTransfer.dropEffect = allowed ? "move" : "none";
  if (allowed) ev.preventDefault();
};

export const leave = (
  ev: DragEvent & { currentTarget: HTMLElement },
  dest: TreeNode,
) => {
  if (
    ev.relatedTarget instanceof Node &&
    ev.currentTarget.contains(ev.relatedTarget)
  )
    return;

  if (state.target === dest) state.target = undefined;
};

export const drop = (ev: DragEvent, dest: TreeNode) => {
  state.target = undefined;
  if (!dragged || !src || !droppable(dest)) return;

  ev.preventDefault();
  ev.stopPropagation();

  src.children.splice(src.children.indexOf(dragged), 1);
  dest.children.push(dragged);

  end();
};
