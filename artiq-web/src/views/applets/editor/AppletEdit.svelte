<script lang="ts">
  import { nameTaken, parent } from "../tree.svelte";
  import type { LeafNode } from "../tree.svelte";
  import type { AppletDraft } from "./AppletEditor.svelte";
  import AppletEditor from "./AppletEditor.svelte";

  let { leaf }: { leaf: LeafNode } = $props();
  let editor: ReturnType<typeof AppletEditor>;

  const update = (draft: AppletDraft) => {
    const p = parent(leaf);
    if (!p) return "Applet no longer exists.";
    if (nameTaken(p.children, leaf, draft.name)) return "Name already exists.";

    Object.assign(leaf, draft);
  };
</script>

<button type="button" onclick={() => editor.open(leaf)}>
  {leaf.name}
</button>
<AppletEditor bind:this={editor} title="Edit applet" onsave={update} />
