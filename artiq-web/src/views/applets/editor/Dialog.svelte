<script lang="ts">
  import { onMount, type Snippet } from "svelte";

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

  onMount(() => {
    document.body.append(dialog);
    return () => dialog.remove();
  });
</script>

<dialog bind:this={dialog}>
  <form onsubmit={save}>
    <h2>{title}</h2>
    {@render children()}

    {#if error}<p>{error}</p>{/if}

    <footer>
      <button class="button" type="button" onclick={() => dialog.close()}
        >Cancel</button
      >
      <button class="button primary" type="submit" {disabled}>Save</button>
    </footer>
  </form>
</dialog>

<style>
  dialog {
    width: min(36rem, calc(100% - 2rem));
    padding: 1.5rem;
    border: none;
    border-radius: 0.5rem;
    background: var(--color-bg-alpha);
    box-shadow: 0 0.5rem 2rem #0003;
  }

  dialog::backdrop {
    background: #0004;
  }

  form {
    display: grid;
    gap: 1rem;
  }

  form :global(label) {
    display: grid;
    gap: 0.25rem;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>
