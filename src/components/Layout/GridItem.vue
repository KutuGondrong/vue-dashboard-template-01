<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  colSpan?: number;
  rowSpan?: number;
}>();

const itemStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.colSpan) style.gridColumn = `span ${props.colSpan} / span ${props.colSpan}`;
  if (props.rowSpan) style.gridRow = `span ${props.rowSpan} / span ${props.rowSpan}`;
  return style;
});
</script>

<template>
  <div :style="itemStyle">
    <slot />
  </div>
</template>
