<script lang="ts">
  let { id, breadcrumb }: { id: string, breadcrumb: string } = $props();
</script>

<div class="grid-stack-item" data-stage-id={id}>
  <div class="grid-stack-item-content">
    <div class="widget-header">{breadcrumb}</div>
    <div class="widget-body"></div>
  </div>
</div>

<style>
  .grid-stack-item {
    border: 1px solid blue;
  }

  :global(.grid-stack) .grid-stack-item > .grid-stack-item-content {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .widget-header {
    flex: 0 0 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: move;
    background: blue;
    color: white;
  }

  .widget-body {
    position: relative;
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
    overflow: auto;
    min-height: 0;
  }

  .widget-body > :global(*) {
    flex: 1 1 0;
    min-width: 0;
  }

  .widget-body > :global(.js-plotly-plot) {
    height: 100%;
  }

  .grid-stack-item > :global(.ui-resizable-se) {
    bottom: 0;
    right: 0;
  }
</style>
