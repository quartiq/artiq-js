<script lang="ts">
  import type { Group } from "../ccb";
  import { leafFrom, newLeaf } from "../tree.svelte";
  import type { AppletDraft } from "./AppletFields.svelte";
  import Editor from "./Editor.svelte";

  let { group = [] }: { group?: Group } = $props();
  let editor: ReturnType<typeof Editor>;

  const create = (draft: AppletDraft) => {
    if (leafFrom({ group, name: draft.name })) return "Name already exists.";
    newLeaf({ ...draft, group, code: "" }).visible = true;
  };
</script>

<button type="button" onclick={() => editor.open()}>Add applet</button>
<Editor bind:this={editor} title="Create applet" onsave={create} />
