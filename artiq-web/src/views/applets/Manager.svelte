<script lang="ts">
  import { root, leafs, detach } from "./tree.svelte";

  const applets = $derived(leafs(root));
</script>

{#each applets as applet (applet)}
  <label>
    {[...applet.group, applet.name].join(" / ")}
    <input bind:value={applet.command} />
  </label>
  <label>
    <input type="checkbox" bind:checked={applet.visible} />
    Visible
  </label>
  <button type="button" onclick={() => detach(applet)}> Remove </button>
{/each}
