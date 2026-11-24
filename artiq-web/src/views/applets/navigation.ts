import type { LeafNode } from "./tree.svelte";

const headers = new Map<LeafNode, HTMLElement>();

export const register = (applet: LeafNode, header: HTMLElement) => {
  headers.set(applet, header);
  return () => {
    headers.delete(applet);
  };
};

export const locate = (applet: LeafNode) => {
  const header = headers.get(applet);
  if (!header) return;

  header.parentElement?.scrollIntoView({
    block: "nearest",
    inline: "nearest",
  });

  header.getAnimations().forEach((animation) => animation.cancel());
  header.animate(
    [
      { backgroundColor: "Highlight" },
      { backgroundColor: "var(--color-bg-beta)" },
    ],
    { duration: 800, easing: "ease-out" },
  );
};
