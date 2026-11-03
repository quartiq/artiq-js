<script lang="ts">
  import type { Group } from "../ccb";
  import { groupFrom, leafs } from "../tree.svelte";
  import type { GroupNode } from "../tree.svelte";
  import type { GroupDraft } from "./GroupFields.svelte";
  import GroupEditor from "./GroupEditor.svelte";

  let {
    branch,
    group,
  }: {
    branch: GroupNode;
    group: Group;
  } = $props();

  let editor: ReturnType<typeof GroupEditor>;

  const update = (draft: GroupDraft) => {
    const existing = groupFrom([...group, draft.name]);
    if (existing && existing !== branch) return "Name already exists.";

    leafs(branch).forEach((leaf) => {
      leaf.group = [
        ...group,
        draft.name,
        ...leaf.group.slice(group.length + 1),
      ];
    });

    Object.assign(branch, draft);
  };
</script>

<button type="button" onclick={() => editor.open(branch)}>
  {branch.name}
</button>
<GroupEditor bind:this={editor} title="Edit group" onsave={update} />
