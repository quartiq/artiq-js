<script lang="ts">
  import type { LeafNode } from "./tree.svelte";

  let {
    title,
    onsave,
  }: {
    title: string;
    onsave: (name: string, command: string) => string | void;
  } = $props();

  let dialog: HTMLDialogElement;
  let name = $state("");
  let command = $state("");
  let error = $state<string>();

  const save = (ev: SubmitEvent) => {
    ev.preventDefault();
    error = onsave(name.trim(), command.trim()) || undefined;
    if (!error) dialog.close();
  };

  export const open = (leaf: Partial<LeafNode> = {}) => {
    name = leaf.name ?? "";
    command = leaf.command ?? "";
    error = undefined;
    dialog.showModal();
  };
</script>

<dialog bind:this={dialog}>
  <form onsubmit={save}>
    <h2>{title}</h2>
    <label>Name <input bind:value={name} required /></label>
    <label>Command <input bind:value={command} required /></label>

    {#if error}<p>{error}</p>{/if}

    <button type="button" onclick={() => dialog.close()}>Cancel</button>
    <button type="submit" disabled={!name.trim() || !command.trim()}
      >Save</button
    >
  </form>
</dialog>
