<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string }>(), { class: '' });
</script>

<template>
  <div
    :class="`animate-pulse rounded-xl border border-stone-200 bg-white p-6 dark:border-surface-600 dark:bg-surface-800 ${props.class}`"
  >
    <div class="mb-4 flex items-center gap-3">
      <div class="h-10 w-10 rounded-full bg-stone-200 dark:bg-surface-600" />
      <div class="space-y-2">
        <div class="h-4 w-32 rounded bg-stone-200 dark:bg-surface-600" />
        <div class="h-3 w-24 rounded bg-stone-200 dark:bg-surface-600" />
      </div>
    </div>
    <div class="space-y-2">
      <div class="h-3 w-full rounded bg-stone-200 dark:bg-surface-600" />
      <div class="h-3 w-3/4 rounded bg-stone-200 dark:bg-surface-600" />
    </div>
  </div>
</template>
