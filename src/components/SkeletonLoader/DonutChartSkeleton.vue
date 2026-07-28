<script setup lang="ts">
import { computed } from 'vue';
import { useLocale } from '@/locales/localeStore';

const props = withDefaults(
  defineProps<{
    class?: string;
    /** Prefer segments.length from the live chart; fallback 3. */
    count?: number;
    size?: number;
  }>(),
  {
    class: '',
    count: 3,
    size: 0,
  },
);

const { t } = useLocale();

const VIEWBOX = 200;
const STROKE_WIDTH = 28;
const RING_INSET = 3;
const SIDE_RING_FLOOR = 160;
const radius = (VIEWBOX - STROKE_WIDTH) / 2 - RING_INSET;
const circumference = 2 * Math.PI * radius;
const center = VIEWBOX / 2;

const loadingCount = computed(() => Math.max(props.count, 3));
const ringSize = computed(() => (props.size > 0 ? props.size : SIDE_RING_FLOOR));
const loadingSegments = computed(() => {
  const count = loadingCount.value;
  const share = circumference / count;
  return Array.from({ length: count }, (_, index) => ({
    dashLength: share * 0.72,
    dashOffset: index * share,
  }));
});
const loadingLegendRows = computed(() => Array.from({ length: loadingCount.value }, (_, i) => i));
</script>

<template>
  <div
    :class="`flex h-full max-h-full w-full min-w-0 max-w-full items-center justify-center gap-4 overflow-hidden ${props.class}`"
    role="status"
    :aria-label="t('components.common.loading')"
  >
    <div
      class="relative shrink-0 animate-pulse"
      :style="{
        width: `${ringSize}px`,
        height: `${ringSize}px`,
      }"
    >
      <svg
        class="h-full w-full overflow-visible"
        :viewBox="`0 0 ${VIEWBOX} ${VIEWBOX}`"
      >
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          class="stroke-stone-100 dark:stroke-surface-700"
          :stroke-width="STROKE_WIDTH"
        />
        <circle
          v-for="(segment, index) in loadingSegments"
          :key="index"
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          class="stroke-stone-200 dark:stroke-surface-600"
          :stroke-width="STROKE_WIDTH"
          stroke-linecap="butt"
          :stroke-dasharray="`${segment.dashLength} ${circumference - segment.dashLength}`"
          :stroke-dashoffset="-segment.dashOffset"
          :transform="`rotate(-90 ${center} ${center})`"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div class="h-6 w-14 rounded bg-stone-200 dark:bg-surface-600" />
        <div class="h-3 w-10 rounded bg-stone-100 dark:bg-surface-700" />
      </div>
    </div>
    <ul class="min-w-0 space-y-3 overflow-hidden">
      <li
        v-for="row in loadingLegendRows"
        :key="row"
        class="flex items-center gap-2"
      >
        <span class="h-3 w-3 shrink-0 rounded-full bg-stone-200 dark:bg-surface-600" />
        <span class="h-3 w-16 rounded bg-stone-200 dark:bg-surface-600" />
        <span class="h-3 w-8 rounded bg-stone-100 dark:bg-surface-700" />
      </li>
    </ul>
  </div>
</template>
