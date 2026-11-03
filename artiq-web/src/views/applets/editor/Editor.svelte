<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import AppletFields from "./AppletFields.svelte";
  import type { AppletDraft } from "./AppletFields.svelte";

  let {
    title,
    onsave,
  }: {
    title: string;
    onsave: (draft: AppletDraft) => string | void;
  } = $props();

  let dialog: ReturnType<typeof Dialog>;
  let draft = $state<AppletDraft>({ name: "", command: "" });

  export const open = (leaf: Partial<AppletDraft> = {}) => {
    draft = {
      name: leaf.name ?? "",
      command: leaf.command ?? "",
    };
    dialog.open();
  };

  const save = () =>
    onsave({
      name: draft.name.trim(),
      command: draft.command.trim(),
    });
</script>

<Dialog
  bind:this={dialog}
  {title}
  onsave={save}
  disabled={!draft.name.trim() || !draft.command.trim()}
>
  <AppletFields bind:draft />
</Dialog>
