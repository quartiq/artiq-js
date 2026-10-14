<script lang="ts">
  let { id, breadcrumb }: { id: string, breadcrumb: string } = $props();
</script>

<div class="grid-stack-item" data-stage-id={id}>
  <div class="grid-stack-item-content">
    <div class="widget-header">{breadcrumb}</div>
    <div class="widget-body"></div>
  </div>
</div>
