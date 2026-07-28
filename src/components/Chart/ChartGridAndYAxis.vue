<script setup lang="ts">
import { formatYAxisTick, getMaxValue, Y_AXIS_RATIOS, type ChartPadding } from './chartUtils';
import type { ChartDataPoint } from '@/models/model.type';

const props = defineProps<{
  points: ChartDataPoint[];
  width: number;
  height: number;
  padding: ChartPadding;
  unit?: string;
  showYAxis: boolean;
}>();

const maxValue = () => getMaxValue(props.points);
const chartHeight = () => props.height - props.padding.top - props.padding.bottom;
</script>

<template>
  <g
    v-for="ratio in Y_AXIS_RATIOS"
    :key="ratio"
  >
    <line
      :x1="padding.left"
      :y1="padding.top + chartHeight() * (1 - ratio)"
      :x2="width - padding.right"
      :y2="padding.top + chartHeight() * (1 - ratio)"
      class="stroke-stone-200 dark:stroke-surface-600"
      stroke-width="1"
      stroke-dasharray="4 4"
    />
    <text
      v-if="showYAxis"
      :x="padding.left - 8"
      :y="padding.top + chartHeight() * (1 - ratio) + 3"
      text-anchor="end"
      class="fill-stone-400 text-[9px] dark:fill-stone-500"
    >
      {{ formatYAxisTick(maxValue() * ratio, unit) }}
    </text>
  </g>
</template>
