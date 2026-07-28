<script setup lang="ts">
import { computed } from 'vue';
import { gapStyle } from './layoutUtils';

const props = defineProps<{
  columns?: number | string;
  rows?: number | string;
  gap?: number | string;
  minChildWidth?: string;
}>();

function resolveGridTemplate(
  value: number | string | undefined,
  prefix: 'columns' | 'rows',
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    return prefix === 'columns'
      ? `repeat(${value}, minmax(0, 1fr))`
      : `repeat(${value}, minmax(0, 1fr))`;
  }
  return value;
}

const gridStyle = computed(() => {
  const style = { ...gapStyle(props.gap) };

  if (props.minChildWidth) {
    return {
      ...style,
      gridTemplateColumns: `repeat(auto-fill, minmax(${props.minChildWidth}, 1fr))`,
    };
  }

  const templateColumns = resolveGridTemplate(props.columns, 'columns');
  const templateRows = resolveGridTemplate(props.rows, 'rows');
  return {
    ...style,
    ...(templateColumns ? { gridTemplateColumns: templateColumns } : {}),
    ...(templateRows ? { gridTemplateRows: templateRows } : {}),
  };
});
</script>

<template>
  <div
    class="grid"
    :style="gridStyle"
  >
    <slot />
  </div>
</template>
