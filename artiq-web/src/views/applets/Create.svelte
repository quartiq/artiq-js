<script lang="ts">
  import type { Group } from "./ccb";
  import { leafFrom, newLeaf } from "./tree.svelte";
  import Editor from "./Editor.svelte";

  let { group = [] }: { group?: Group } = $props();
  let editor: ReturnType<typeof Editor>;

  const create = (name: string, command: string) => {
    if (leafFrom({ group, name })) return "Name already exists.";
    newLeaf({ name, command, group, code: "" }).visible = true;
  };
</script>

<button type="button" onclick={() => editor.open()}>Add applet</button>
<Editor bind:this={editor} title="Create applet" onsave={create} />
