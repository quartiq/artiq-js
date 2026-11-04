<script lang="ts">
  import { dup, parent } from "../tree.svelte";
  import type { LeafNode } from "../tree.svelte";
  import type { AppletDraft } from "./AppletFields.svelte";
  import AppletEditor from "./AppletEditor.svelte";

  let { leaf }: { leaf: LeafNode } = $props();
  let editor: ReturnType<typeof AppletEditor>;

  const update = (draft: AppletDraft) => {
    const p = parent(leaf);
    if (!p) return "Applet no longer exists.";
    if (dup(leaf, p, draft.name)) return "Name already exists.";

    Object.assign(leaf, draft);
  };
</script>

<button type="button" onclick={() => editor.open(leaf)}>
  {leaf.name}
</button>
<AppletEditor bind:this={editor} title="Edit applet" onsave={update} />
