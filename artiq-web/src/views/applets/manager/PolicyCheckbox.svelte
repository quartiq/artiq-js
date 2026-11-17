<script module lang="ts">
  import type { PolicyKey } from "../tree.svelte";

  export const labels: Record<PolicyKey, string> = {
    allowCreation: "Allow CCB creation and update",
    allowVisCtrl: "Allow CCB visibility control",
  };
</script>

<script lang="ts">
  import type { PolicyValue } from "../tree.svelte";

  let {
    value = $bindable(),
    policy,
  }: {
    value: PolicyValue;
    policy: PolicyKey;
  } = $props();

  const label = $derived(labels[policy]);
  const vals: PolicyValue[] = [undefined, true, false];
  const next: (v: PolicyValue) => PolicyValue = (v) =>
    vals[(vals.indexOf(v) + 1) % vals.length];
</script>

<input
  type="checkbox"
  title={label}
  aria-label={label}
  checked={value === true}
  indeterminate={value === undefined}
  onchange={() => (value = next(value))}
/>
