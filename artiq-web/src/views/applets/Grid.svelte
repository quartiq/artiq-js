<script lang="ts">
  import type { Component } from "svelte";
  import type { LayoutItem } from "@appulsauce/svelte-grid";
  import Grid, { GridItem } from "@appulsauce/svelte-grid";
  import shellQuote from "shell-quote";

  import type { Group } from "./ccb";
  import Icon from "../../Icon.svelte";
  import { root, leaves } from "./tree.svelte";
  import { isSelected, registerItem, selectRow } from "./select.svelte";

  type AppletModule = {
    default: Component<{ argv: string[] }>;
    size?: Pick<LayoutItem, "w" | "h">;
  };

  const modules = import.meta.glob<AppletModule>("./modules/*.svelte", {
    eager: true,
  });

  const fmt = (group: Group) => (group.length ? ` · ${group.join(" › ")}` : "");
</script>

<Grid cols={12} itemSize={{ height: 25 }} collision="push">
  {#each leaves(root) as { leaf: applet, group } (applet)}
    {#if applet.visible}
      {@const [name, ...argv] = shellQuote.parse(applet.command) as string[]}
      {@const module = modules[`./modules/${name}.svelte`]}

      <GridItem
        x={applet.geometry?.x ?? 0}
        y={applet.geometry?.y ?? 0}
        w={applet.geometry?.w ?? module?.size?.w ?? 3}
        h={applet.geometry?.h ?? module?.size?.h ?? 10}
        min={{ w: 2, h: 3 }}
        onchange={({ item }) => {
          const { x, y, w, h } = item;
          applet.geometry = { x, y, w, h };
        }}
        previewClass="applet-preview"
      >
        {#snippet moveHandle({ moveStart })}
          <header
            class:selected={isSelected(applet)}
            {@attach (el) => registerItem(applet, el.parentElement!)}
          >
            <button
              class="title"
              title={applet.name + fmt(group)}
              onpointerdown={moveStart}
              onclick={() => selectRow(applet)}
            >
              <strong>{applet.name}</strong><span>{fmt(group)}</span>
            </button>
            <button
              title="Hide applet"
              aria-label={`Hide ${applet.name}`}
              onclick={() => (applet.visible = false)}
            >
              <Icon name="minus" />
            </button>
          </header>
        {/snippet}

        <div class="body">
          {#key applet.command}
            <svelte:boundary>
              {#if module}
                {@const View = module.default}
                <View {argv} />
              {:else}
                <p>Unknown applet module: "{name}"</p>
              {/if}

              {#snippet failed(error, reset)}
                <p>{error instanceof Error ? error.message : String(error)}</p>
                <button type="button" onclick={reset}>Retry</button>
              {/snippet}
            </svelte:boundary>
          {/key}
        </div>
      </GridItem>
    {/if}
  {/each}
</Grid>

<style>
  :global(.item-default) {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-bg-beta);
    border-radius: 0.25rem;
  }

  :global(.svelte-grid-extended .item-default.non-active-default) {
    transition: none;
  }

  header {
    display: flex;
    background: var(--color-bg-beta);
  }

  header.selected {
    background: color-mix(in srgb, Highlight 20%, var(--color-bg-alpha));
  }

  header .title {
    flex: 1;
    cursor: move;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0.25rem 0.5rem;
    font-weight: normal;
    color: var(--color-fg-beta);
  }

  header button:not(.title) {
    display: grid;
    place-items: center;
    padding: 0.25rem 0.5rem;
  }

  .title strong {
    color: initial;
  }

  .body {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    user-select: text;
  }

  :global(.applet-preview) {
    border-radius: 0.25rem;
    background: color-mix(in srgb, Highlight 15%, transparent);
    border: 1px solid Highlight;
  }
</style>
