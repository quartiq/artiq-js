<script lang="ts">
  let {
    expanded = $bindable(),
    name,
  }: {
    expanded: boolean;
    name: string;
  } = $props();
</script>

<button
  type="button"
  aria-expanded={expanded}
  aria-label={`${expanded ? "Collapse" : "Expand"} ${name}`}
  onclick={() => (expanded = !expanded)}
>
  {expanded ? "▾" : "▸"}
</button>

<style>
  button {
    width: 2rem;
    text-align: center;
  }
</style>
