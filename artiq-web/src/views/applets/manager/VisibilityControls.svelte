<script lang="ts">
  import { leaves, type Node } from "../tree.svelte";

  let { node }: { node: Node } = $props();
</script>

<button
  type="button"
  onclick={() => leaves(node).forEach(({ leaf }) => (leaf.visible = true))}
>
  Show all
</button>

<button
  type="button"
  onclick={() => leaves(node).forEach(({ leaf }) => (leaf.visible = false))}
>
  Hide all
</button>
