<script lang="ts">
  import type { Group } from "../ccb";
  import { leafFrom, newLeaf } from "../tree.svelte";
  import type { AppletDraft } from "./AppletEditor.svelte";
  import AppletEditor from "./AppletEditor.svelte";

  let { group = [] }: { group?: Group } = $props();
  let editor: ReturnType<typeof AppletEditor>;

  const create = (draft: AppletDraft) => {
    if (leafFrom({ group, name: draft.name })) return "Name already exists.";
    newLeaf({ ...draft, group, code: "" }).visible = true;
  };
</script>

<button type="button" onclick={() => editor.open()}>Add applet</button>
<AppletEditor bind:this={editor} title="Create applet" onsave={create} />
