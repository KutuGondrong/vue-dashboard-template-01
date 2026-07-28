<script setup lang="ts">
import { computed } from 'vue';
import { cn, gapStyle } from './layoutUtils';

import type { FlexDirection, FlexWrap, FlexJustify, FlexAlign } from './layout.types';

const props = withDefaults(
  defineProps<{
    direction?: FlexDirection;
    wrap?: FlexWrap;
    justify?: FlexJustify;
    align?: FlexAlign;
    gap?: number | string;
    vertical?: boolean;
  }>(),
  {
    direction: 'row',
    wrap: 'nowrap',
    justify: 'start',
    align: 'stretch',
    vertical: false,
  },
);

const flexDirectionClasses: Record<FlexDirection, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
};

const flexWrapClasses: Record<FlexWrap, string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const flexJustifyClasses: Record<FlexJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const flexAlignClasses: Record<FlexAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const resolvedDirection = computed(() => (props.vertical ? 'column' : props.direction));

const flexClass = computed(() =>
  cn(
    'flex',
    flexDirectionClasses[resolvedDirection.value],
    flexWrapClasses[props.wrap],
    flexJustifyClasses[props.justify],
    flexAlignClasses[props.align],
  ),
);

const flexStyle = computed(() => gapStyle(props.gap));
</script>

<template>
  <div
    :class="flexClass"
    :style="flexStyle"
  >
    <slot />
  </div>
</template>
