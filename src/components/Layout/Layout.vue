<script setup lang="ts">
import { computed, provide, useSlots, type VNode } from 'vue';
import { cn } from './layoutUtils';

const LAYOUT_SIDER_KEY = Symbol('LayoutSider');

provide(LAYOUT_SIDER_KEY, true);

const props = withDefaults(defineProps<{ hasSider?: boolean }>(), { hasSider: false });

const slots = useSlots();

function isLayoutSider(vnode: VNode): boolean {
  return (vnode.type as { __name?: string })?.__name === 'LayoutSider';
}

const containsSider = computed(() => {
  if (props.hasSider) return true;
  const defaultSlot = slots.default?.() ?? [];
  return defaultSlot.some((vnode) => isLayoutSider(vnode));
});
</script>

<template>
  <div
    :class="
      cn(
        'flex min-h-[240px] w-full flex-col rounded-xl border border-stone-200 bg-white dark:border-surface-600 dark:bg-surface-800',
        containsSider && 'sm:flex-row',
      )
    "
  >
    <slot />
  </div>
</template>
