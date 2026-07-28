<script setup lang="ts">
import { computed } from 'vue';
import { useLocale } from '@/locales/localeStore';
import { getChartPadding } from '@/components/Chart/chartUtils';

const props = withDefaults(
  defineProps<{
    class?: string;
    height?: number;
    /** Prefer points.length from the live chart; fallback 6. */
    count?: number;
    showValues?: boolean;
    showYAxis?: boolean;
  }>(),
  {
    class: '',
    height: 220,
    count: 6,
    showValues: true,
    showYAxis: true,
  },
);

const { t } = useLocale();
const width = 480;
const loadingPadding = computed(() => getChartPadding(props.showYAxis, props.showValues));
const loadingCount = computed(() => Math.max(props.count, 6));
const loadingSlots = computed(() => {
  const pad = loadingPadding.value;
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = props.height - pad.top - pad.bottom;
  const count = loadingCount.value;
  return Array.from({ length: count }, (_, index) => {
    const ratio = count === 1 ? 0.5 : index / (count - 1);
    const yWave = 0.28 + 0.42 * Math.sin(ratio * Math.PI * 1.5 + 0.4);
    const x = pad.left + ratio * chartWidth;
    const y = pad.top + chartHeight * yWave;
    return {
      x,
      y,
      valueWidth: 22 + (index % 3) * 4,
      labelWidth: 18 + (index % 2) * 6,
    };
  });
});
const loadingLinePath = computed(() =>
  loadingSlots.value
    .map((slot, index) => `${index === 0 ? 'M' : 'L'} ${slot.x} ${slot.y}`)
    .join(' '),
);
const loadingYTicks = computed(() => {
  const pad = loadingPadding.value;
  const chartHeight = props.height - pad.top - pad.bottom;
  return [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: pad.top + chartHeight * (1 - ratio),
    tickWidth: ratio === 0 ? 10 : 16 + Math.round(ratio * 8),
  }));
});
</script>

<template>
  <div
    :class="`w-full min-w-0 ${props.class}`"
    role="status"
    :aria-label="t('components.common.loading')"
  >
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="h-auto w-full max-w-full animate-pulse"
    >
      <g
        v-for="(tick, index) in loadingYTicks"
        :key="`y-${index}`"
      >
        <line
          :x1="loadingPadding.left"
          :y1="tick.y"
          :x2="width - loadingPadding.right"
          :y2="tick.y"
          class="stroke-stone-200 dark:stroke-surface-600"
          stroke-width="1"
          stroke-dasharray="4 4"
        />
        <rect
          :x="loadingPadding.left - 8 - tick.tickWidth"
          :y="tick.y - 4"
          :width="tick.tickWidth"
          height="8"
          rx="2"
          class="fill-stone-200 dark:fill-surface-600"
        />
      </g>

      <path
        :d="loadingLinePath"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-stone-200 dark:text-surface-600"
      />
      <g
        v-for="(slot, index) in loadingSlots"
        :key="`point-${index}`"
      >
        <rect
          :x="slot.x - slot.valueWidth / 2"
          :y="slot.y - 18"
          :width="slot.valueWidth"
          height="8"
          rx="2"
          class="fill-stone-300 dark:fill-surface-500"
        />
        <circle
          :cx="slot.x"
          :cy="slot.y"
          r="4"
          class="fill-stone-300 dark:fill-surface-500"
        />
        <rect
          :x="slot.x - slot.labelWidth / 2"
          :y="height - loadingPadding.bottom + 10"
          :width="slot.labelWidth"
          height="8"
          rx="2"
          class="fill-stone-200 dark:fill-surface-600"
        />
      </g>
    </svg>
  </div>
</template>
