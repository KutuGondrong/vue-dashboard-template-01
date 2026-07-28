<script setup lang="ts">
import { computed } from 'vue';
import { colorTokens } from '@/config/color.tokens';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'custom';
type BadgeSize = 'sm' | 'md';

export interface BadgeCustomColors {
  background: string;
  color: string;
  dot?: string;
}

const DEFAULT_CUSTOM_COLORS: BadgeCustomColors = {
  background: colorTokens.primary[100],
  color: colorTokens.primary[700],
  dot: colorTokens.primary[500],
};

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    customColors?: BadgeCustomColors;
  }>(),
  {
    variant: 'default',
    size: 'sm',
    dot: false,
  },
);

const variantClasses: Record<Exclude<BadgeVariant, 'custom'>, string> = {
  default: 'bg-stone-100 text-stone-700 dark:bg-surface-600 dark:text-stone-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  success: 'bg-success-500/15 text-success-600 dark:bg-success-500/20 dark:text-success-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  danger: 'bg-danger-500/15 text-danger-600 dark:bg-danger-500/20 dark:text-danger-400',
  info: 'bg-info-500/15 text-info-600 dark:bg-info-500/20 dark:text-info-400',
};

const dotColors: Record<Exclude<BadgeVariant, 'custom'>, string> = {
  default: 'bg-stone-500',
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-yellow-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

const isCustom = computed(() => props.variant === 'custom');

const resolvedCustom = computed(() =>
  isCustom.value ? { ...DEFAULT_CUSTOM_COLORS, ...props.customColors } : undefined,
);

const badgeClass = computed(() => {
  const base = `inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[props.size]}`;
  if (isCustom.value) return base;
  return `${base} ${variantClasses[props.variant as Exclude<BadgeVariant, 'custom'>]}`;
});

const badgeStyle = computed(() => {
  const colors = resolvedCustom.value;
  if (!colors) return undefined;
  return { backgroundColor: colors.background, color: colors.color };
});

const dotClass = computed(() => {
  if (isCustom.value) return 'h-1.5 w-1.5 shrink-0 rounded-full';
  return `h-1.5 w-1.5 shrink-0 rounded-full ${dotColors[props.variant as Exclude<BadgeVariant, 'custom'>]}`;
});

const dotStyle = computed(() => {
  const colors = resolvedCustom.value;
  if (!isCustom.value || !colors) return undefined;
  return { backgroundColor: colors.dot ?? colors.color };
});
</script>

<template>
  <span
    :class="badgeClass"
    :style="badgeStyle"
  >
    <span
      v-if="dot"
      :class="dotClass"
      :style="dotStyle"
      aria-hidden="true"
    />
    <slot />
  </span>
</template>
