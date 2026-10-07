<script lang="ts">
  import { onMount } from "svelte";
  import * as dbio from "../applets/dbio";

  const target = "/applets";
  let keys: dbio.Key[] = $state([]);

  const refresh = () => {
    keys = dbio.keys(target).sort((a, b) => a.name.localeCompare(b.name));
  };

  onMount(() => {
    refresh();
    return dbio.onChange(target, refresh);
  });
</script>

<ul>
  {#each keys as k (k.name)}
    <li>
      <a href={target + k.name}>
        {#if k.name}<span>{k.name}</span>{:else}<i>default</i>{/if}
      </a>
      <button
        onclick={() => {
          dbio.remove(k);
          refresh();
        }}>❌</button
      >
    </li>
  {/each}
</ul>
