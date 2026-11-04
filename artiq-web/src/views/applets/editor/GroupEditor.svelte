<script module lang="ts">
  import type { Node } from "../tree.svelte";
  export type GroupDraft = Pick<Node, "name">;
</script>

<script lang="ts">
  import Dialog from "./Dialog.svelte";

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
  <label>Name <input bind:value={draft.name} required /></label>
</Dialog>
