<script setup lang="ts">
import { useLocaleStore } from '@/locales/localeStore';

defineProps<{ class?: string }>();

const localeStore = useLocaleStore();
</script>

<template>
  <div :class="['animate-pulse space-y-6 p-6', $props.class]">
    <div class="flex items-center justify-between">
      <div class="space-y-2">
        <div class="h-8 w-48 rounded-lg bg-stone-200 dark:bg-surface-600" />
        <div class="h-4 w-72 rounded bg-stone-200 dark:bg-surface-600" />
      </div>
      <div class="h-10 w-32 rounded-lg bg-stone-200 dark:bg-surface-600" />
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="i in 3"
        :key="i"
        class="rounded-xl border border-stone-200 bg-white p-6 dark:border-surface-600 dark:bg-surface-800"
      >
        <div class="mb-4 h-4 w-24 rounded bg-stone-200 dark:bg-surface-600" />
        <div class="h-8 w-16 rounded bg-stone-200 dark:bg-surface-600" />
      </div>
    </div>

    <div
      class="rounded-xl border border-stone-200 bg-white dark:border-surface-600 dark:bg-surface-800"
    >
      <div class="border-b border-stone-200 p-4 dark:border-surface-600">
        <div class="h-4 w-full rounded bg-stone-200 dark:bg-surface-600" />
      </div>
      <div
        v-for="i in 5"
        :key="`row-${i}`"
        class="border-b border-stone-100 p-4 last:border-0 dark:border-surface-600/50"
      >
        <div class="h-4 w-full rounded bg-stone-200 dark:bg-surface-600" />
      </div>
    </div>

    <span class="sr-only">{{ localeStore.t('components.common.loading') }}</span>
  </div>
</template>
