<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';
import { cn } from '@/components/Layout/layoutUtils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  isLoading: false,
  fullWidth: false,
  disabled: false,
  type: 'button',
});

const attrs = useAttrs();
const slots = useSlots();

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
  secondary:
    'bg-stone-100 text-stone-900 hover:bg-stone-200 focus:ring-stone-500 dark:bg-surface-600 dark:text-stone-100 dark:hover:bg-surface-500',
  outline:
    'border border-stone-300 bg-transparent text-stone-700 hover:bg-stone-50 focus:ring-primary-500 dark:border-surface-500 dark:text-stone-300 dark:hover:bg-surface-700',
  ghost:
    'bg-transparent text-stone-700 hover:bg-stone-100 focus:ring-stone-500 dark:text-stone-300 dark:hover:bg-surface-700',
  danger:
    'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 dark:bg-danger-500 dark:hover:bg-danger-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const isDisabled = computed(() => props.disabled || props.isLoading);

const buttonClass = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-surface-900',
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.fullWidth && 'w-full',
    attrs.class as string | undefined,
  ),
);

const passthroughAttrs = computed(() => {
  const rest = { ...attrs };
  delete rest.class;
  return rest;
});
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :class="buttonClass"
    v-bind="passthroughAttrs"
  >
    <svg
      v-if="isLoading"
      class="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot
      v-else-if="slots.leftIcon"
      name="leftIcon"
    />
    <slot />
    <slot
      v-if="!isLoading && slots.rightIcon"
      name="rightIcon"
    />
  </button>
</template>
