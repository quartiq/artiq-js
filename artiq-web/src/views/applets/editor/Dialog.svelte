<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title,
    children,
    onsave,
    disabled = false,
  }: {
    title: string;
    children: Snippet;
    onsave: () => string | void;
    disabled?: boolean;
  } = $props();

  let dialog: HTMLDialogElement;
  let error = $state<string>();

  export const open = () => {
    error = undefined;
    dialog.showModal();
  };

  let save = (ev: SubmitEvent) => {
    ev.preventDefault();
    if (disabled) return;

    error = onsave() || undefined;
    if (!error) dialog.close();
  };
</script>

<dialog bind:this={dialog}>
  <form onsubmit={save}>
    <h2>{title}</h2>
    {@render children()}

    {#if error}<p>{error}</p>{/if}

    <button type="button" onclick={() => dialog.close()}>Cancel</button>
    <button type="submit" {disabled}>Save</button>
  </form>
</dialog>
