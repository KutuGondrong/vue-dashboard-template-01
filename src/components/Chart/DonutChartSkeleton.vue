<script setup lang="ts">
/** @deprecated Prefer `DonutChartSkeleton` / `<SkeletonLoader type="donut" />` from `@/components/SkeletonLoader`. */
import { DonutChartSkeleton } from '@/components/SkeletonLoader';

withDefaults(defineProps<{ class?: string }>(), { class: '' });
</script>

<template>
  <div
    :class="`rounded-xl border border-stone-200 bg-white p-6 dark:border-surface-600 dark:bg-surface-800 ${$props.class}`"
  >
    <div class="mb-4 h-4 w-40 animate-pulse rounded bg-stone-200 dark:bg-surface-600" />
    <DonutChartSkeleton />
  </div>
</template>
