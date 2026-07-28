<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { cn } from '@/components/Layout/layoutUtils';
import { useLocale } from '@/locales/localeStore';
import { isPeekingCollapseTrigger } from './navMenuUtils';
import type { CollapseTriggerPosition } from './navMenu.types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    collapsed: boolean;
    position: CollapseTriggerPosition;
    labelVariant?: 'menu' | 'sidebar';
  }>(),
  {
    labelVariant: 'menu',
  },
);

const emit = defineEmits<{ toggle: [] }>();

const attrs = useAttrs();
const { t } = useLocale();

const extraClass = computed(() => attrs.class as string | undefined);

const menuToggleLabel = computed(() =>
  props.collapsed
    ? t(
        props.labelVariant === 'sidebar'
          ? 'components.common.expandSidebar'
          : 'components.common.expandMenu',
      )
    : t(
        props.labelVariant === 'sidebar'
          ? 'components.common.collapseSidebar'
          : 'components.common.collapseMenu',
      ),
);

const isPeeking = computed(() => isPeekingCollapseTrigger(props.position));
const isCenter = computed(() => props.position === 'centerPeeking');
</script>

<template>
  <button
    v-if="isPeeking"
    type="button"
    :class="
      cn(
        'absolute right-0 z-50 flex translate-x-1/2 items-center justify-center rounded-md border border-stone-200/80 bg-stone-100/90 text-stone-500 shadow-sm backdrop-blur-[2px] transition-colors hover:bg-stone-200/95 hover:text-stone-700 dark:border-surface-600/80 dark:bg-surface-800/90 dark:text-stone-400 dark:hover:bg-surface-600/95 dark:hover:text-stone-200',
        isCenter ? 'top-1/2 h-10 w-5 -translate-y-1/2' : 'top-3 h-6 w-5',
        extraClass,
      )
    "
    :aria-label="menuToggleLabel"
    @click="emit('toggle')"
  >
    <svg
      class="h-3.5 w-3.5"
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
  <div
    v-else-if="position === 'top'"
    :class="cn('shrink-0 border-b border-stone-200 p-2 dark:border-surface-600', extraClass)"
  >
    <button
      type="button"
      class="flex w-full items-center justify-center rounded-lg py-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-surface-700 dark:hover:text-stone-300"
      :aria-label="menuToggleLabel"
      @click="emit('toggle')"
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
  </div>
  <button
    v-else
    type="button"
    :class="
      cn(
        'flex w-full items-center justify-center border-t border-stone-200 px-2 py-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:border-surface-600 dark:hover:bg-surface-700 dark:hover:text-stone-300',
        extraClass,
      )
    "
    :aria-label="menuToggleLabel"
    @click="emit('toggle')"
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
</template>
