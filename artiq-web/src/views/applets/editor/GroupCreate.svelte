<script lang="ts">
  import type { Group } from "../ccb";
  import { groupFrom, newGroup } from "../tree.svelte";
  import type { GroupDraft } from "./GroupEditor.svelte";
  import GroupEditor from "./GroupEditor.svelte";

  let { group = [] }: { group?: Group } = $props();
  let editor: ReturnType<typeof GroupEditor>;

  const create = ({ name }: GroupDraft) => {
    if (groupFrom([...group, name])) return "Group already exists.";
    newGroup([...group, name]);
  };
</script>

<button type="button" onclick={() => editor.open()}>Add group</button>
<GroupEditor bind:this={editor} title="Create group" onsave={create} />
