<script setup lang="ts">
import { Comment, Text, computed, useSlots, type VNode } from 'vue';
import { cn } from './layoutUtils';

import type { DividerOrientation, DividerVariant, DividerLabelPosition } from './layout.types';

const props = withDefaults(
  defineProps<{
    orientation?: DividerOrientation;
    variant?: DividerVariant;
    plain?: boolean;
    labelPosition?: DividerLabelPosition;
  }>(),
  {
    orientation: 'horizontal',
    variant: 'solid',
    plain: false,
    labelPosition: 'center',
  },
);

const slots = useSlots();

const dividerBorderClasses: Record<DividerVariant, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

const dividerLineBorderClasses: Record<DividerVariant, string> = {
  solid: 'before:border-solid after:border-solid',
  dashed: 'before:border-dashed after:border-dashed',
  dotted: 'before:border-dotted after:border-dotted',
};

const dividerLabelPositionClasses: Record<DividerLabelPosition, string> = {
  left: 'before:flex-none before:w-[5%] after:flex-1',
  center: 'before:flex-1 after:flex-1',
  right: 'before:flex-1 after:flex-none after:w-[5%]',
};

const dividerVerticalLabelPositionClasses: Record<
  DividerLabelPosition,
  { top: string; bottom: string }
> = {
  left: { top: 'flex-none min-h-[8px]', bottom: 'flex-1' },
  center: { top: 'flex-1', bottom: 'flex-1' },
  right: { top: 'flex-1', bottom: 'flex-none min-h-[8px]' },
};

function vnodeHasContent(vnode: VNode): boolean {
  if (vnode.type === Comment) return false;
  if (vnode.type === Text) {
    return String(vnode.children ?? '').trim().length > 0;
  }
  if (typeof vnode.children === 'string') {
    return vnode.children.trim().length > 0;
  }
  if (Array.isArray(vnode.children)) {
    if (vnode.children.length === 0) return false;
    return vnode.children.some((child) =>
      typeof child === 'string' ? child.trim().length > 0 : vnodeHasContent(child as VNode),
    );
  }
  if (typeof vnode.type === 'object') return true;
  return false;
}

function defaultSlotHasContent(): boolean {
  const defaultSlot = slots.default;
  if (!defaultSlot) return false;
  return defaultSlot().some((vnode) => vnodeHasContent(vnode));
}

const borderClass = computed(() => dividerBorderClasses[props.variant]);
const lineBorderClass = computed(() => dividerLineBorderClasses[props.variant]);
const verticalTopLineClass = computed(
  () => dividerVerticalLabelPositionClasses[props.labelPosition].top,
);
const verticalBottomLineClass = computed(
  () => dividerVerticalLabelPositionClasses[props.labelPosition].bottom,
);
</script>

<template>
  <div
    v-if="orientation === 'vertical' && !defaultSlotHasContent()"
    role="separator"
    aria-orientation="vertical"
    :class="
      cn(
        'min-h-[1.5em] w-px shrink-0 self-stretch',
        plain ? 'mx-0' : 'mx-4',
        'border-l border-stone-200 dark:border-surface-600',
        borderClass,
      )
    "
  />
  <div
    v-else-if="orientation === 'vertical'"
    role="separator"
    aria-orientation="vertical"
    :class="
      cn(
        'flex h-full min-h-[inherit] shrink-0 flex-col items-center gap-2 self-stretch text-sm text-stone-500 dark:text-stone-400',
        plain ? 'mx-0 py-0' : 'mx-4 py-2',
      )
    "
  >
    <span
      :class="
        cn(
          'min-h-[8px] w-px border-l border-stone-200 dark:border-surface-600',
          borderClass,
          verticalTopLineClass,
        )
      "
      aria-hidden="true"
    />
    <span class="shrink-0 px-2 text-center text-xs font-medium leading-tight"><slot /></span>
    <span
      :class="
        cn(
          'min-h-[8px] w-px border-l border-stone-200 dark:border-surface-600',
          borderClass,
          verticalBottomLineClass,
        )
      "
      aria-hidden="true"
    />
  </div>
  <div
    v-else-if="defaultSlotHasContent()"
    role="separator"
    aria-orientation="horizontal"
    :class="
      cn(
        'flex w-full items-center gap-4 text-sm text-stone-500 dark:text-stone-400',
        'before:h-px before:min-h-px before:border-t before:border-stone-200 before:content-[\'\'] dark:before:border-surface-600',
        'after:h-px after:min-h-px after:border-t after:border-stone-200 after:content-[\'\'] dark:after:border-surface-600',
        lineBorderClass,
        plain ? 'my-0' : 'my-4',
        dividerLabelPositionClasses[labelPosition],
      )
    "
  >
    <span class="shrink-0 px-4 font-medium"><slot /></span>
  </div>
  <div
    v-else
    role="separator"
    aria-orientation="horizontal"
    :class="
      cn(
        'w-full border-t border-stone-200 dark:border-surface-600',
        borderClass,
        plain ? 'my-0' : 'my-4',
      )
    "
  />
</template>
