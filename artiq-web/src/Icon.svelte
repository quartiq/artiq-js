<script module lang="ts">
  // Adapted from Lucide (ISC license): https://lucide.dev/license
  // Changes: square stroke caps and sharp joins.
  const icons = {
    // https://lucide.dev/icons/chevron-right
    "chevron-right": ["m9 6 6 6-6 6"],

    // https://lucide.dev/icons/chart-spline
    "chart-spline": [
      "M3 3v16a2 2 0 0 0 2 2h16",
      "M7 14c2 0 2-8 4-8s2 12 4 12 2-8 6-8",
    ],

    // https://lucide.dev/icons/minus
    minus: ["M5 12h14"],
  };
</script>

<script lang="ts">
  let {
    name,
    size = 16,
    rotate = 0,
  }: {
    name: keyof typeof icons;
    size?: number;
    rotate?: number;
  } = $props();
</script>

<!-- Stroke weight tuned for Atkinson Hyperlegible Next 400. -->
<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  aria-hidden="true"
  focusable="false"
>
  <g transform={`rotate(${rotate} 12 12)`}>
    {#each icons[name] as d}
      <path {d} />
    {/each}
  </g>
</svg>
