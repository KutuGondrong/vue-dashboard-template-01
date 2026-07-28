<script setup lang="ts">
import type { SkeletonType } from './skeleton.types';
import DashboardSkeleton from './DashboardSkeleton.vue';
import PageSkeleton from './PageSkeleton.vue';
import CardSkeleton from './CardSkeleton.vue';
import LineChartSkeleton from './LineChartSkeleton.vue';
import BarChartSkeleton from './BarChartSkeleton.vue';
import DonutChartSkeleton from './DonutChartSkeleton.vue';

withDefaults(
  defineProps<{
    /** Which skeleton layout to render. */
    type?: SkeletonType;
    class?: string;
    /** Chart skeletons: pixel height (line/bar). */
    height?: number;
    /** Chart skeletons: placeholder count (points/segments). */
    count?: number;
    /** Line chart skeleton axis/value placeholders. */
    showValues?: boolean;
    showYAxis?: boolean;
    /** Donut chart skeleton ring size (0 = default floor). */
    size?: number;
  }>(),
  {
    type: 'dashboard',
    class: '',
    height: 220,
    count: 0,
    showValues: true,
    showYAxis: true,
    size: 0,
  },
);
</script>

<template>
  <PageSkeleton
    v-if="type === 'page'"
    :class="$props.class"
  />
  <CardSkeleton
    v-else-if="type === 'card'"
    :class="$props.class"
  />
  <LineChartSkeleton
    v-else-if="type === 'line'"
    :class="$props.class"
    :height="height"
    :count="count > 0 ? count : 6"
    :show-values="showValues"
    :show-y-axis="showYAxis"
  />
  <BarChartSkeleton
    v-else-if="type === 'bar'"
    :class="$props.class"
    :height="height"
    :count="count > 0 ? count : 7"
  />
  <DonutChartSkeleton
    v-else-if="type === 'donut'"
    :class="$props.class"
    :count="count > 0 ? count : 3"
    :size="size"
  />
  <DashboardSkeleton
    v-else
    :class="$props.class || 'w-full max-w-3xl'"
  />
</template>
