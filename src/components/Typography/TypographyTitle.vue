<script setup lang="ts">
import { computed } from 'vue';
import type {
  TypographyAlign,
  TypographyColor,
  TypographyLevel,
  TypographyWeight,
} from './typography.types';
import { alignClasses, colorClasses, variantClasses, weightClasses } from './typographyClasses';

const props = withDefaults(
  defineProps<{
    level?: TypographyLevel;
    color?: TypographyColor;
    weight?: TypographyWeight;
    align?: TypographyAlign;
    truncate?: boolean;
    tag?: string;
  }>(),
  {
    level: 1,
    color: 'default',
    align: 'left',
    truncate: false,
  },
);

const tagName = computed(() => props.tag ?? `h${props.level}`);
const variant = computed(() => `h${props.level}` as keyof typeof variantClasses);

const classes = computed(() =>
  [
    variantClasses[variant.value],
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
    :is="tagName"
    :class="classes"
  >
    <slot />
  </component>
</template>
