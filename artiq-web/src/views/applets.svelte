<script lang="ts">
  import { onMount } from "svelte";

  import "./applets/screencast.css";

  import * as datasets from "./applets/datasets.svelte";
  import * as ccb from "./applets/ccb";
  import { root, leafs, leafFrom, newLeaf, write } from "./applets/tree.svelte";
  import * as permission from "./applets/permission";

  import Grid from "./applets/Grid.svelte";
  import Manager from "./applets/Manager.svelte";

  let showManager = $state(true);
  const applets = $derived(leafs(root));

  const create_applet = (args: ccb.CreateArgs) => {
    if (!permission.granted("allowCreation", args)) return;

    const leaf = Object.assign(leafFrom(args) ?? newLeaf(args), args);
    if (!permission.granted("allowVisCtrl", args)) return;

    leaf.visible = true;
  };

  const restart_applet = (key: ccb.TargetKey) => {
    permission.leafsByPolicy("allowVisCtrl", key).forEach((applet) => {
      applet.visible = true;
    });
  };

  const disable_applet = (key: ccb.TargetKey) => {
    permission.leafsByPolicy("allowVisCtrl", key).forEach((applet) => {
      applet.visible = false;
    });
  };

  $effect(() => write());

  onMount(datasets.listen);

  onMount(() => {
    ccb.handleFuncs({
      create_applet,
      restart_applet,
      disable_applet,

      // TODO: remove legacy alias from ARTIQ, see: https://git.m-labs.hk/M-Labs/artiq/issues/1871
      disable_applet_group: ({ group }) =>
        disable_applet({ group, name: null }),
    });

    return ccb.listen();
  });
</script>

<section class="applet-screen">
  <header class="dashboard-header">
    <div>
      <span class="eyebrow">ARTIQ / CONTROL &amp; ACQUISITION</span>
      <h1>Experiment dashboard</h1>
    </div>

    <div class="dashboard-actions">
      <span class="dashboard-count">
        {applets.filter((a) => a.visible).length} / {applets.length} visible
      </span>
      <button
        type="button"
        aria-expanded={showManager}
        aria-controls="applet-manager"
        onclick={() => (showManager = !showManager)}
      >
        {showManager ? "Hide manager" : "Show manager"}
      </button>
    </div>
  </header>

  <div class="dashboard-workspace" class:focused={!showManager}>
    <aside id="applet-manager" class="manager-panel" hidden={!showManager}>
      <header>
        <h2>Applets</h2>
        <span class="count">{applets.length}</span>
      </header>
      <Manager />
    </aside>

    <div class="dashboard-stage">
      <Grid />
      {#if !applets.some((a) => a.visible)}
        <div class="dashboard-empty">
          <h2>Your experiment, in view.</h2>
          <p>
            Reveal an applet in the manager or run an experiment that creates
            one.
          </p>
        </div>
      {/if}
    </div>
  </div>
</section>
