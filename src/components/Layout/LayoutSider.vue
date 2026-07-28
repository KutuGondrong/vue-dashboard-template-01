<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { cn } from './layoutUtils';
import { useLocale } from '@/locales/localeStore';

const props = withDefaults(
  defineProps<{
    width?: number | string;
    collapsed?: boolean;
    collapsedWidth?: number | string;
    collapsible?: boolean;
    trigger?: null;
  }>(),
  {
    width: 200,
    collapsed: false,
    collapsedWidth: 64,
    collapsible: false,
  },
);

const emit = defineEmits<{ collapse: [collapsed: boolean] }>();

const { t } = useLocale();
const slots = useSlots();

function toCssSize(value: number | string | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

const resolvedWidth = computed(() => (props.collapsed ? props.collapsedWidth : props.width));

const asideStyle = computed(() => ({
  width: toCssSize(resolvedWidth.value, '200px'),
}));

function handleToggle() {
  emit('collapse', !props.collapsed);
}

const showDefaultTrigger = computed(
  () => props.collapsible && props.trigger !== null && !slots.trigger,
);
</script>

<template>
  <aside
    :class="
      cn(
        'flex shrink-0 flex-col overflow-hidden border-stone-200 bg-stone-50 transition-[width] duration-200 dark:border-surface-600 dark:bg-surface-700/60',
        'border-b sm:border-b-0 sm:border-r',
      )
    "
    :style="asideStyle"
  >
    <div class="flex-1 overflow-auto p-3 text-sm text-stone-600 dark:text-stone-400">
      <slot />
    </div>
    <slot
      v-if="collapsible && trigger !== null"
      name="trigger"
    >
      <button
        v-if="showDefaultTrigger"
        type="button"
        class="flex w-full items-center justify-center border-t border-stone-200 py-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:border-surface-600 dark:hover:bg-surface-700 dark:hover:text-stone-300"
        :aria-label="
          collapsed ? t('components.common.expandSidebar') : t('components.common.collapseSidebar')
        "
        @click="handleToggle"
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
            :d="collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'"
          />
        </svg>
      </button>
    </slot>
  </aside>
</template>
