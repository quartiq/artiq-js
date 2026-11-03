<script module lang="ts">
  import type { LeafNode } from "../tree.svelte";

  export type AppletDraft = Pick<LeafNode, "name" | "command">;
</script>

<script lang="ts">
  let { draft = $bindable() }: { draft: AppletDraft } = $props();
</script>

<label>Name <input bind:value={draft.name} required /></label>
<label>Command <input bind:value={draft.command} required /></label>
