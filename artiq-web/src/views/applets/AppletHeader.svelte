<script lang="ts">
  import Icon from "../../Icon.svelte";
  import type { Group } from "./ccb";
  import type { LeafNode } from "./tree.svelte";
  import { isSelected, registerItem, selectRow } from "./select.svelte";

  let {
    applet,
    group,
    readOnly = false,
    moveStart,
    onhide,
  }: {
    applet: LeafNode;
    group: Group;
    readOnly?: boolean;
    moveStart?: (ev: PointerEvent) => void;
    onhide?: () => void;
  } = $props();

  const fmt = (group: Group) => (group.length ? ` · ${group.join(" › ")}` : "");
</script>

{#snippet title()}
  <strong>{applet.name}</strong><span>{fmt(group)}</span>
{/snippet}

<header
  class:selected={!readOnly && isSelected(applet)}
  {@attach (el) => registerItem(applet, el.parentElement!)}
>
  {#if readOnly}
    <span class="title" title={applet.name + fmt(group)}>
      {@render title()}
    </span>
  {:else}
    <button
      class="title"
      title={applet.name + fmt(group)}
      onpointerdown={moveStart}
      onclick={() => selectRow(applet)}
    >
      {@render title()}
    </button>
    <button
      title="Hide applet"
      aria-label={`Hide ${applet.name}`}
      onclick={onhide}
    >
      <Icon name="minus" />
    </button>
  {/if}
</header>

<style>
  header {
    display: flex;
    background: var(--color-bg-beta);
  }

  header.selected {
    background: color-mix(in srgb, Highlight 20%, var(--color-bg-alpha));
  }

  header .title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0.25rem 0.5rem;
    font-weight: normal;
    color: var(--color-fg-beta);
  }

  header span.title {
    user-select: text;
  }

  header button.title {
    cursor: move;
  }

  header button:not(.title) {
    display: grid;
    place-items: center;
    padding: 0.25rem 0.5rem;
  }

  .title strong {
    color: initial;
  }
</style>
