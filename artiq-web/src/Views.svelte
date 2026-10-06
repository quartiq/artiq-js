<script lang="ts">
  import { onMount } from "svelte";

  const views = import.meta.glob("./views/*.ts");
  const names = Object.keys(views).map((path) =>
    path.slice("./views/".length, -".ts".length),
  );

  onMount(() => {
    const name = location.pathname.slice(1);
    void views[`./views/${name}.ts`]?.();
  });
</script>

<nav>
  <span>Available views:</span>
  {#each names as n}
    <a href={`/${n}`}>{n}</a>
  {/each}
</nav>
