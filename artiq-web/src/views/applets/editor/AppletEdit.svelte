<script lang="ts">
  import { leafFrom } from "../tree.svelte";
  import type { LeafNode } from "../tree.svelte";
  import type { AppletDraft } from "./AppletFields.svelte";
  import AppletEditor from "./AppletEditor.svelte";

  let { applet }: { applet: LeafNode } = $props();
  let editor: ReturnType<typeof AppletEditor>;

  const update = (draft: AppletDraft) => {
    const existing = leafFrom({
      group: applet.group,
      name: draft.name,
    });

    if (existing && existing !== applet) return "Name already exists.";

    Object.assign(applet, draft);
  };
</script>

<button type="button" onclick={() => editor.open(applet)}>
  {applet.name}
</button>
<AppletEditor bind:this={editor} title="Edit applet" onsave={update} />
