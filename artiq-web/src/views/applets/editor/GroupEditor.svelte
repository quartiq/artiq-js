<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import GroupFields from "./GroupFields.svelte";
  import type { GroupDraft } from "./GroupFields.svelte";

  let {
    title,
    onsave,
  }: {
    title: string;
    onsave: (draft: GroupDraft) => string | void;
  } = $props();

  let dialog: ReturnType<typeof Dialog>;
  let draft = $state<GroupDraft>({ name: "" });

  export const open = (init: Partial<GroupDraft> = {}) => {
    draft = { name: init.name ?? "" };
    dialog.open();
  };

  const save = () => onsave({ name: draft.name.trim() });
</script>

<Dialog bind:this={dialog} {title} onsave={save} disabled={!draft.name.trim()}>
  <GroupFields bind:draft />
</Dialog>
