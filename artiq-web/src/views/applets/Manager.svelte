<script lang="ts">
  import { root, leafs, detach } from "./tree.svelte";

  const applets = $derived(leafs(root));
</script>

<label>
  <input type="checkbox" bind:checked={root.policy.allowCreation} />
  Allow CCB creation and update
</label>

<label>
  <input type="checkbox" bind:checked={root.policy.allowVisCtrl} />
  Allow CCB visibility control
</label>

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
