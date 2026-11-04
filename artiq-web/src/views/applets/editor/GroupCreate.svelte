<script lang="ts">
  import type { Group } from "../ccb";
  import { branchFrom, newBranch } from "../tree.svelte";
  import type { GroupDraft } from "./GroupEditor.svelte";
  import GroupEditor from "./GroupEditor.svelte";

  let { group = [] }: { group?: Group } = $props();
  let editor: ReturnType<typeof GroupEditor>;

  const create = ({ name }: GroupDraft) => {
    if (branchFrom([...group, name])) return "Group already exists.";
    newBranch([...group, name]);
  };
</script>

<button type="button" onclick={() => editor.open()}>Add group</button>
<GroupEditor bind:this={editor} title="Create group" onsave={create} />
