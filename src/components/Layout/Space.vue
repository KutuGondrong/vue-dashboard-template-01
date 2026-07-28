<script setup lang="ts">
import { computed, useSlots, type VNode } from 'vue';
import { cn, gapStyle } from './layoutUtils';

import type { SpaceDirection, SpaceSize, SpaceAlign } from './layout.types';

const props = withDefaults(
  defineProps<{
    direction?: SpaceDirection;
    size?: SpaceSize | number;
    wrap?: boolean;
    align?: SpaceAlign;
  }>(),
  {
    direction: 'horizontal',
    size: 'md' satisfies SpaceSize,
    wrap: false,
    align: 'center',
  },
);

const slots = useSlots();

const spaceSizeMap: Record<SpaceSize, number> = {
  sm: 8,
  md: 16,
  lg: 24,
};

const spaceAlignClasses: Record<SpaceAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
};

const gapPx = computed(() =>
  typeof props.size === 'number' ? props.size : spaceSizeMap[props.size],
);

const childNodes = computed(() => (slots.default?.() ?? []).filter(Boolean) as VNode[]);

const isVertical = computed(() => props.direction === 'vertical');

const spaceClass = computed(() =>
  cn(
    'inline-flex',
    isVertical.value ? 'flex-col' : 'flex-row',
    props.wrap && !isVertical.value && 'flex-wrap',
    spaceAlignClasses[props.align],
  ),
);

const hasSplit = computed(() => Boolean(slots.split));
</script>

<template>
  <div
    v-if="childNodes.length > 0"
    :class="spaceClass"
    :style="hasSplit ? undefined : gapStyle(gapPx)"
  >
    <div
      v-for="(child, index) in childNodes"
      :key="index"
      :class="cn('inline-flex', isVertical ? 'flex-col' : 'flex-row', spaceAlignClasses[align])"
      :style="
        hasSplit && index > 0
          ? isVertical
            ? { marginTop: `${gapPx}px` }
            : { marginLeft: `${gapPx}px` }
          : undefined
      "
    >
      <span
        v-if="hasSplit && index > 0"
        :class="
          cn(
            'inline-flex shrink-0 text-stone-300 dark:text-stone-600',
            isVertical ? 'mb-1' : 'mr-1',
          )
        "
        aria-hidden="true"
      >
        <slot name="split" />
      </span>
      <component :is="child" />
    </div>
  </div>
</template>
