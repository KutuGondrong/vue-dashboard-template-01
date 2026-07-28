<script setup lang="ts">
import { Comment, Fragment, Text, computed, useSlots, type VNode } from 'vue';

const props = withDefaults(
  defineProps<{
    columns?: number;
    gap?: number | string;
  }>(),
  {
    columns: 3,
    gap: 16,
  },
);

const slots = useSlots();

function flattenVNodes(nodes: VNode[]): VNode[] {
  const result: VNode[] = [];

  for (const node of nodes) {
    if (!node || node.type === Comment) continue;

    if (node.type === Fragment) {
      const children = node.children;
      if (Array.isArray(children)) {
        result.push(...flattenVNodes(children as VNode[]));
      }
      continue;
    }

    if (node.type === Text) continue;

    result.push(node);
  }

  return result;
}

const masonryItems = computed(() => flattenVNodes(slots.default?.() ?? []));

const masonryStyle = computed(() => ({
  columnCount: props.columns,
  columnGap: typeof props.gap === 'number' ? `${props.gap}px` : props.gap,
}));

const itemStyle = computed(() => ({
  marginBottom: typeof props.gap === 'number' ? `${props.gap}px` : props.gap,
}));
</script>

<template>
  <div
    class="w-full"
    :style="masonryStyle"
  >
    <div
      v-for="(child, index) in masonryItems"
      :key="child.key ?? index"
      class="w-full break-inside-avoid"
      :style="itemStyle"
    >
      <component :is="child" />
    </div>
  </div>
</template>
