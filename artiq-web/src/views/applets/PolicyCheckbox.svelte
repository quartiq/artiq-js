<script lang="ts">
  import type { PolicyValue } from "./tree.svelte";

  let {
    value = $bindable(),
    label,
  }: {
    value: PolicyValue;
    label: string;
  } = $props();

  const vals: PolicyValue[] = [undefined, true, false];
  const next: (v: PolicyValue) => PolicyValue = (v) =>
    vals[(vals.indexOf(v) + 1) % vals.length];
</script>

<label>
  <input
    type="checkbox"
    checked={value === true}
    indeterminate={value === undefined}
    onchange={() => (value = next(value))}
  />
  {label}
</label>
