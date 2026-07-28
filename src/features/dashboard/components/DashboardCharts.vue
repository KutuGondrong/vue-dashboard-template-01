<script setup lang="ts">
import { Typography } from '@/components/Typography';
import LineChart from '@/components/Chart/LineChart.vue';
import BarChart from '@/components/Chart/BarChart.vue';
import DonutChart from '@/components/Chart/DonutChart.vue';
import type { BarChartData, DonutChartData, LineChartData } from '@/models/model.type';

defineProps<{
  revenueChart: LineChartData;
  activityChart: BarChartData;
  userDistribution: DonutChartData;
  resolveLabel: (key: string) => string;
}>();
</script>

<template>
  <div class="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12">
    <section
      class="min-w-0 overflow-hidden rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-50/80 via-white to-white shadow-sm lg:col-span-8 dark:border-primary-800/30 dark:from-primary-950/30 dark:via-surface-900 dark:to-surface-900"
    >
      <div class="border-b border-primary-100/80 px-5 py-4 dark:border-primary-900/40">
        <Typography.Overline class="text-primary-600 dark:text-primary-400">
          {{ resolveLabel('dashboard.charts.performance') }}
        </Typography.Overline>
        <Typography.Text
          weight="semibold"
          class="mt-0.5 block text-base text-stone-900 dark:text-white"
        >
          {{ resolveLabel(revenueChart.titleKey) }}
        </Typography.Text>
      </div>
      <div class="p-4 sm:p-5">
        <LineChart
          :points="revenueChart.points"
          :unit="revenueChart.unit"
          color-token="primary"
        />
      </div>
    </section>

    <section
      class="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:col-span-4 lg:flex lg:min-h-0 lg:flex-col dark:border-surface-600 dark:bg-surface-800"
    >
      <div class="shrink-0 border-b border-stone-100 px-5 py-4 dark:border-surface-600">
        <Typography.Overline class="text-stone-500 dark:text-stone-400">
          {{ resolveLabel('dashboard.charts.breakdown') }}
        </Typography.Overline>
        <Typography.Text
          weight="semibold"
          class="mt-0.5 block text-base text-stone-900 dark:text-white"
        >
          {{ resolveLabel(userDistribution.titleKey) }}
        </Typography.Text>
      </div>
      <div
        class="w-full min-w-0 overflow-hidden p-4 sm:p-5 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
      >
        <DonutChart
          class="w-full min-w-0 lg:min-h-0 lg:flex-1"
          :segments="
            userDistribution.segments.map((segment) => ({
              ...segment,
              label: resolveLabel(segment.labelKey),
            }))
          "
          :total="userDistribution.total"
          :center-label="resolveLabel('dashboard.charts.totalUsers')"
        />
      </div>
    </section>

    <section
      class="overflow-hidden rounded-2xl border border-accent-200/60 bg-gradient-to-br from-accent-50/60 via-white to-white shadow-sm lg:col-span-12 dark:border-accent-800/30 dark:from-accent-950/20 dark:via-surface-900 dark:to-surface-900"
    >
      <div class="border-b border-accent-100/80 px-5 py-4 dark:border-accent-900/30">
        <Typography.Overline class="text-accent-600 dark:text-accent-400">
          {{ resolveLabel('dashboard.charts.engagement') }}
        </Typography.Overline>
        <Typography.Text
          weight="semibold"
          class="mt-0.5 block text-base text-stone-900 dark:text-white"
        >
          {{ resolveLabel(activityChart.titleKey) }}
        </Typography.Text>
      </div>
      <div class="p-4 sm:p-5">
        <BarChart
          :points="activityChart.points"
          color-token="accent"
        />
      </div>
    </section>
  </div>
</template>
