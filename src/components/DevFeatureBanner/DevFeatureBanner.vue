<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div
    role="status"
    class="flex min-w-0 items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 dark:border-yellow-700/60 dark:bg-yellow-900/20"
  >
    <span
      class="mt-0.5 shrink-0 rounded bg-yellow-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-800 dark:bg-yellow-800/60 dark:text-yellow-200"
    >
      DEV
    </span>
    <div class="min-w-0">
      <p class="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
        {{ title }}
      </p>
      <p class="mt-1 text-sm text-yellow-800/90 dark:text-yellow-200/90">
        {{ description }}
      </p>
    </div>
  </div>
</template>
