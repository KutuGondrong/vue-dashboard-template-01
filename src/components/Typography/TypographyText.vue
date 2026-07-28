<script setup lang="ts">
import { computed } from 'vue';
import type { TypographyAlign, TypographyColor, TypographyWeight } from './typography.types';
import { alignClasses, colorClasses, variantClasses, weightClasses } from './typographyClasses';

const props = withDefaults(
  defineProps<{
    color?: TypographyColor;
    weight?: TypographyWeight;
    align?: TypographyAlign;
    truncate?: boolean;
    tag?: string;
  }>(),
  {
    color: 'default',
    align: 'left',
    truncate: false,
    tag: 'span',
  },
);

const classes = computed(() =>
  [
    variantClasses.bodySm,
    colorClasses[props.color],
    props.weight ? weightClasses[props.weight] : '',
    alignClasses[props.align],
    props.truncate ? 'truncate' : '',
  ]
    .filter(Boolean)
    .join(' '),
);
</script>

<template>
  <component
    :is="tag"
    :class="classes"
  >
    <slot />
  </component>
</template>
