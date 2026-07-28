<script setup lang="ts">
import { computed } from 'vue';
import { DEFAULT_CHART_COLOR_TOKEN } from '@/config/color.tokens';
import { useLocale } from '@/locales/localeStore';
import { BarChartSkeleton } from '@/components/SkeletonLoader';
import ChartGridAndYAxis from './ChartGridAndYAxis.vue';
import {
  formatChartValue,
  getChartPadding,
  getMaxValue,
  resolvePointChartColor,
} from './chartUtils';
import type { BarChartProps } from './chart.types';
import { useChartAnimationKey } from './useChartAnimationKey';

const props = withDefaults(defineProps<BarChartProps>(), {
  height: 220,
  colorToken: DEFAULT_CHART_COLOR_TOKEN,
  class: '',
  animated: true,
  showValues: true,
  showYAxis: true,
  isLoading: false,
});

const { t } = useLocale();
const animationKey = useChartAnimationKey(
  () => props.animated,
  () => props.height,
);

const width = 480;
const padding = computed(() => getChartPadding(props.showYAxis, props.showValues));
const chartHeight = computed(() => props.height - padding.value.top - padding.value.bottom);
const maxValue = computed(() => getMaxValue(props.points));
const barGap = 12;
const barWidth = computed(() =>
  props.points.length > 0
    ? (width - padding.value.left - padding.value.right - barGap * (props.points.length - 1)) /
      props.points.length
    : 0,
);
</script>

<template>
  <BarChartSkeleton
    v-if="isLoading"
    :class="props.class"
    :height="height"
    :count="points.length"
  />
  <div
    v-else-if="points.length === 0"
    :class="`flex items-center justify-center text-sm text-stone-400 dark:text-stone-500 ${props.class}`"
    :style="{ height }"
  >
    {{ t('components.common.noData') }}
  </div>
  <div
    v-else
    :class="`w-full min-w-0 ${props.class}`"
  >
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="h-auto w-full max-w-full"
      role="img"
      :aria-label="t('components.common.barChart')"
    >
      <ChartGridAndYAxis
        :points="points"
        :width="width"
        :height="height"
        :padding="padding"
        :show-y-axis="showYAxis"
      />

      <g
        v-for="(point, index) in points"
        :key="`${point.label}-${animationKey}`"
      >
        <rect
          :x="padding.left + index * (barWidth + barGap)"
          :y="
            padding.top +
              chartHeight -
              (maxValue === 0 ? 0 : (point.value / maxValue) * chartHeight)
          "
          :width="barWidth"
          :height="maxValue === 0 ? 0 : (point.value / maxValue) * chartHeight"
          rx="4"
          :fill="resolvePointChartColor(point, colorToken)"
          opacity="0.85"
          :class="animated ? 'origin-bottom animate-chart-bar-grow' : undefined"
          :style="
            animated
              ? {
                transformBox: 'fill-box',
                transformOrigin: 'bottom',
                animationDelay: `${index * 0.07}s`,
              }
              : undefined
          "
        />
        <text
          v-if="showValues && maxValue > 0 && (point.value / maxValue) * chartHeight > 0"
          :x="padding.left + index * (barWidth + barGap) + barWidth / 2"
          :y="padding.top + chartHeight - (point.value / maxValue) * chartHeight - 6"
          text-anchor="middle"
          class="fill-stone-600 text-[9px] font-medium dark:fill-stone-300"
        >
          {{ formatChartValue(point.value) }}
        </text>
        <text
          :x="padding.left + index * (barWidth + barGap) + barWidth / 2"
          :y="height - padding.bottom + 16"
          text-anchor="middle"
          class="fill-stone-500 text-[10px] dark:fill-stone-400"
        >
          {{ point.label }}
        </text>
        <title>{{ `${point.label}: ${formatChartValue(point.value)}` }}</title>
      </g>
    </svg>
  </div>
</template>
