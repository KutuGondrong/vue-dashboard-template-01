<script lang="ts">
import { defineComponent, h } from 'vue';
import LineChart from '@/components/Chart/LineChart.vue';
import BarChart from '@/components/Chart/BarChart.vue';
import DonutChart from '@/components/Chart/DonutChart.vue';

export default defineComponent({
  name: 'DashboardChartsSkeleton',
  setup() {
    return () =>
      h('div', { class: 'grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12' }, [
        h(
          'div',
          {
            class:
              'min-h-[320px] overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-8 dark:border-surface-600 dark:bg-surface-800',
          },
          [
            h('div', {
              class: 'mb-4 h-4 w-40 animate-pulse rounded bg-stone-200 dark:bg-surface-600',
            }),
            h(LineChart, { points: [], unit: 'M', colorToken: 'primary', isLoading: true }),
          ],
        ),
        h(
          'div',
          {
            class:
              'min-h-[320px] overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-4 dark:border-surface-600 dark:bg-surface-800',
          },
          [
            h('div', {
              class: 'mb-4 h-4 w-32 animate-pulse rounded bg-stone-200 dark:bg-surface-600',
            }),
            h(DonutChart, {
              class: 'min-h-[220px]',
              segments: [],
              total: 0,
              isLoading: true,
            }),
          ],
        ),
        h(
          'div',
          {
            class:
              'min-h-[280px] overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-12 dark:border-surface-600 dark:bg-surface-800',
          },
          [
            h('div', {
              class: 'mb-4 h-4 w-44 animate-pulse rounded bg-stone-200 dark:bg-surface-600',
            }),
            h(BarChart, { points: [], colorToken: 'accent', isLoading: true }),
          ],
        ),
      ]);
  },
});
</script>
