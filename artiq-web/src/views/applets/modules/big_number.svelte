<script lang="ts">
  import { map } from "../datasets.svelte";

  let { args }: { args: any } = $props();

  const keypath = $derived(args[0]);
  const dataset = $derived(map.get(keypath));
</script>

<div class="number">
  {dataset ? String(dataset[1]) : "-"}
</div>

<style>
  .number {
    font-family: monospace;
    font-size: 72px;
  }
</style>
