<script setup lang="ts">
import type { SupportedLocale } from '@/config/app.config';

const LOCALE_OPTIONS: { value: SupportedLocale; flag: string; label: string }[] = [
  { value: 'en', flag: '🇬🇧', label: 'EN' },
  { value: 'id', flag: '🇮🇩', label: 'ID' },
];

defineProps<{
  locale: SupportedLocale;
  showLabels?: boolean;
  compact?: boolean;
}>();

defineEmits<{ change: [locale: SupportedLocale] }>();
</script>

<template>
  <div
    :class="[
      'flex shrink-0 rounded-lg border border-stone-200 bg-stone-100 dark:border-surface-500 dark:bg-surface-800',
      compact ? 'p-0.5' : 'p-1',
    ]"
    role="group"
    aria-label="Language"
  >
    <button
      v-for="option in LOCALE_OPTIONS"
      :key="option.value"
      type="button"
      :aria-pressed="locale === option.value"
      :aria-current="locale === option.value ? 'true' : undefined"
      :aria-label="option.label"
      :class="[
        'flex items-center justify-center gap-1 rounded-md font-semibold transition-all',
        compact ? 'h-8 w-8 text-base' : 'px-2 py-1.5 text-xs sm:min-w-[3.25rem] sm:px-2.5',
        locale === option.value
          ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-600 dark:bg-primary-500 dark:ring-primary-500'
          : 'text-stone-500 hover:bg-stone-200/80 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-surface-600/60 dark:hover:text-stone-200',
      ]"
      @click="$emit('change', option.value)"
    >
      <span aria-hidden="true">{{ option.flag }}</span>
      <span
        v-if="!compact"
        :class="showLabels ? 'inline' : 'hidden sm:inline'"
      >{{
        option.label
      }}</span>
    </button>
  </div>
</template>
