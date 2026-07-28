<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { DEFAULT_CHART_COLOR_TOKEN } from '@/config/color.tokens';
import { useLocale } from '@/locales/localeStore';
import { LineChartSkeleton } from '@/components/SkeletonLoader';
import ChartGridAndYAxis from './ChartGridAndYAxis.vue';
import {
  buildAreaPath,
  buildLinePath,
  formatChartValue,
  getChartPadding,
  getPointCoordinates,
  resolvePointChartColor,
} from './chartUtils';
import type { LineChartProps } from './chart.types';
import { useChartAnimationKey } from './useChartAnimationKey';

const props = withDefaults(defineProps<LineChartProps>(), {
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
const gradientId = `line-chart-${Math.random().toString(36).slice(2, 9)}`;
const pathRef = ref<SVGPathElement | null>(null);
const pathLength = ref(0);

const width = 480;
const padding = computed(() => getChartPadding(props.showYAxis, props.showValues));
const coordinates = computed(() =>
  getPointCoordinates(props.points, width, props.height, padding.value),
);
const pointColors = computed(() =>
  props.points.map((point) => resolvePointChartColor(point, props.colorToken)),
);
const useSegmentColors = computed(() => new Set(pointColors.value).size > 1);
const linePath = computed(() => buildLinePath(props.points, width, props.height, padding.value));
const areaPath = computed(() => buildAreaPath(props.points, width, props.height, padding.value));
const primaryColor = computed(
  () => pointColors.value[0] ?? resolvePointChartColor(props.points[0], props.colorToken),
);

watch([linePath, animationKey, useSegmentColors], () => {
  if (!useSegmentColors.value && pathRef.value) {
    pathLength.value = pathRef.value.getTotalLength();
  }
});
</script>

<template>
  <LineChartSkeleton
    v-if="isLoading"
    :class="props.class"
    :height="height"
    :count="points.length"
    :show-values="showValues"
    :show-y-axis="showYAxis"
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
      :aria-label="t('components.common.lineChart')"
    >
      <defs>
        <linearGradient
          :id="gradientId"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            :stop-color="primaryColor"
            stop-opacity="0.25"
          />
          <stop
            offset="100%"
            :stop-color="primaryColor"
            stop-opacity="0"
          />
        </linearGradient>
        <linearGradient
          v-if="useSegmentColors"
          :id="`${gradientId}-area`"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            v-for="(color, index) in pointColors"
            :key="`${color}-${index}`"
            :offset="`${(index / Math.max(points.length - 1, 1)) * 100}%`"
            :stop-color="color"
            stop-opacity="0.2"
          />
        </linearGradient>
      </defs>

      <ChartGridAndYAxis
        :points="points"
        :width="width"
        :height="height"
        :padding="padding"
        :unit="unit"
        :show-y-axis="showYAxis"
      />

      <path
        :key="`area-${animationKey}`"
        :d="areaPath"
        :fill="useSegmentColors ? `url(#${gradientId}-area)` : `url(#${gradientId})`"
        :class="animated ? 'animate-chart-fade-in' : undefined"
      />

      <template v-if="useSegmentColors">
        <line
          v-for="(coord, index) in coordinates.slice(1)"
          :key="`segment-${index}-${animationKey}`"
          :x1="coordinates[index].x"
          :y1="coordinates[index].y"
          :x2="coord.x"
          :y2="coord.y"
          :stroke="pointColors[index + 1]"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="animated ? 'animate-chart-fade-in' : undefined"
          :style="animated ? { animationDelay: `${index * 0.08}s` } : undefined"
        />
      </template>
      <path
        v-else
        :key="`line-${animationKey}`"
        ref="pathRef"
        :d="linePath"
        fill="none"
        :stroke="primaryColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :style="
          animated && pathLength > 0
            ? {
              strokeDasharray: pathLength,
              strokeDashoffset: pathLength,
              animation: 'chart-draw 1.2s ease-out forwards',
            }
            : undefined
        "
      />

      <g
        v-for="(point, index) in points"
        :key="`${point.label}-${animationKey}`"
      >
        <circle
          :cx="coordinates[index].x"
          :cy="coordinates[index].y"
          r="4"
          :fill="pointColors[index]"
          :class="animated ? 'animate-chart-dot-pop' : undefined"
          :style="animated ? { animationDelay: `${0.8 + index * 0.08}s` } : undefined"
        />
        <text
          v-if="showValues"
          :x="coordinates[index].x"
          :y="coordinates[index].y - 10"
          text-anchor="middle"
          class="fill-stone-600 text-[9px] font-medium dark:fill-stone-300"
        >
          {{ formatChartValue(point.value, unit) }}
        </text>
        <text
          :x="coordinates[index].x"
          :y="height - padding.bottom + 16"
          text-anchor="middle"
          class="fill-stone-500 text-[10px] dark:fill-stone-400"
        >
          {{ point.label }}
        </text>
        <title>{{ `${point.label}: ${formatChartValue(point.value, unit)}` }}</title>
      </g>
    </svg>
  </div>
</template>
