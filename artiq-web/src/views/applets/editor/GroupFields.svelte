<script module lang="ts">
  import type { Node } from "../tree.svelte";

  export type GroupDraft = Pick<Node, "name">;
</script>

<script lang="ts">
  let { draft = $bindable() }: { draft: GroupDraft } = $props();
</script>

<label>Name <input bind:value={draft.name} required /></label>
