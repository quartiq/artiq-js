<script module lang="ts">
  import type { LeafNode } from "../tree.svelte";
  export type AppletDraft = Pick<LeafNode, "name" | "command">;
</script>

<script lang="ts">
  import Dialog from "./Dialog.svelte";

  let {
    title,
    onsave,
  }: {
    title: string;
    onsave: (draft: AppletDraft) => string | void;
  } = $props();

  let dialog: ReturnType<typeof Dialog>;
  let draft = $state<AppletDraft>({ name: "", command: "" });

  export const open = (init: Partial<AppletDraft> = {}) => {
    draft = {
      name: init.name ?? "",
      command: init.command ?? "",
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
  <label>Name <input bind:value={draft.name} required /></label>
  <label>Command <input bind:value={draft.command} required /></label>
</Dialog>
