<script setup lang="ts">
import type { MetricCardProps } from './chart.types';

const props = withDefaults(defineProps<MetricCardProps>(), { class: '' });
</script>

<template>
  <div
    :class="`rounded-xl border border-stone-200 bg-white p-6 dark:border-surface-600 dark:bg-surface-800 ${props.class}`"
  >
    <h3 class="mb-4 text-sm font-semibold text-stone-900 dark:text-white">
      {{ title }}
    </h3>
    <slot />
  </div>
</template>
