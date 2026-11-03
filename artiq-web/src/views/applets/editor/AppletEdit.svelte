<script lang="ts">
  import { leafFrom } from "../tree.svelte";
  import type { LeafNode } from "../tree.svelte";
  import type { AppletDraft } from "./AppletFields.svelte";
  import AppletEditor from "./AppletEditor.svelte";

  let { leaf }: { leaf: LeafNode } = $props();
  let editor: ReturnType<typeof AppletEditor>;

  const update = (draft: AppletDraft) => {
    const existing = leafFrom({
      group: leaf.group,
      name: draft.name,
    });

    if (existing && existing !== leaf) return "Name already exists.";

    Object.assign(leaf, draft);
  };
</script>

<button type="button" onclick={() => editor.open(leaf)}>
  {leaf.name}
</button>
<AppletEditor bind:this={editor} title="Edit applet" onsave={update} />
