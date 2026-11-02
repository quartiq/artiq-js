<script lang="ts">
  import { leafFrom } from "./tree.svelte";
  import type { LeafNode } from "./tree.svelte";
  import Editor from "./Editor.svelte";

  let { applet }: { applet: LeafNode } = $props();
  let editor: ReturnType<typeof Editor>;

  const update = (name: string, command: string) => {
    const existing = leafFrom({ group: applet.group, name });
    if (existing && existing !== applet) return "Name already exists.";

    Object.assign(applet, { name, command });
  };
</script>

<button type="button" onclick={() => editor.open(applet)}>
  {applet.name}
</button>
<Editor bind:this={editor} title="Edit applet" onsave={update} />
