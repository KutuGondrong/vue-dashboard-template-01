<script setup lang="ts">
import { cn } from '@/components/Layout/layoutUtils';
import { useLocale } from '@/locales/localeStore';

withDefaults(
  defineProps<{
    direction: 'up' | 'down';
    variant?: 'pill' | 'bar';
  }>(),
  {
    variant: 'pill',
  },
);

const emit = defineEmits<{ click: [] }>();

const { t } = useLocale();

const label = (direction: 'up' | 'down') =>
  direction === 'up' ? t('components.common.navScrollUp') : t('components.common.navScrollDown');
</script>

<template>
  <button
    v-if="variant === 'bar'"
    type="button"
    :aria-label="label(direction)"
    :class="
      cn(
        'flex w-full shrink-0 items-center justify-center py-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:border-surface-600 dark:hover:bg-surface-700 dark:hover:text-stone-300',
        direction === 'up' ? 'border-b border-stone-200' : 'border-t border-stone-200',
      )
    "
    @click="emit('click')"
  >
    <svg
      class="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        :d="direction === 'up' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"
      />
    </svg>
  </button>
  <button
    v-else
    type="button"
    :aria-label="label(direction)"
    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-300/80 bg-transparent text-stone-500 transition-[transform,background-color,color] duration-200 ease-out hover:scale-105 hover:border-stone-400 hover:bg-stone-100 hover:text-stone-700 active:scale-100 dark:border-surface-500 dark:text-stone-400 dark:hover:border-surface-400 dark:hover:bg-surface-700 dark:hover:text-stone-200"
    @click="emit('click')"
  >
    <svg
      v-if="direction === 'up'"
      class="h-3.5 w-3.5"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        d="M4.5 9.5 8 6 11.5 9.5"
      />
      <path
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        d="M8 10.5 V14"
      />
    </svg>
    <svg
      v-else
      class="h-3.5 w-3.5"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        d="M8 2 V5.5"
      />
      <path
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        d="M4.5 6.5 8 10 11.5 6.5"
      />
    </svg>
  </button>
</template>
