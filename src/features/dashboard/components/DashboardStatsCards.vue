<script setup lang="ts">
import { type Component, defineComponent, h } from 'vue';
import Badge from '@/components/Badge/Badge.vue';
import { Typography } from '@/components/Typography';
import { UsersIcon } from '@/layouts/sidebar/components/SidebarIcons';
import type { DashboardStats, TrendDirection } from '@/models/model.type';

defineProps<{
  stats: DashboardStats;
  resolveLabel: (key: string) => string;
}>();

function trendBadgeVariant(trend: TrendDirection): 'success' | 'danger' | 'default' {
  if (trend === 'up') return 'success';
  if (trend === 'down') return 'danger';
  return 'default';
}

function formatChange(trend: TrendDirection, value: number): string {
  const prefix = trend === 'down' ? '-' : trend === 'up' ? '+' : '';
  return `${prefix}${value}%`;
}

const ActivityIcon = defineComponent({
  name: 'ActivityIcon',
  render() {
    return h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': 2,
        d: 'M13 10V3L4 14h7v7l9-11h-7z',
      }),
    ]);
  },
});

const SessionsIcon = defineComponent({
  name: 'SessionsIcon',
  render() {
    return h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': 2,
        d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      }),
    ]);
  },
});

interface StatTheme {
  icon: Component;
  surface: string;
  iconWrap: string;
  accent: string;
}

const STAT_THEMES: Record<string, StatTheme> = {
  stat_users: {
    icon: UsersIcon,
    surface:
      'border-primary-200/70 bg-gradient-to-br from-primary-50 via-white to-white dark:border-primary-800/40 dark:from-primary-950/50 dark:via-surface-900 dark:to-surface-900',
    iconWrap: 'bg-primary-500 text-white shadow-lg shadow-primary-500/30',
    accent: 'text-primary-600 dark:text-primary-400',
  },
  stat_sessions: {
    icon: SessionsIcon,
    surface:
      'border-accent-200/70 bg-gradient-to-br from-accent-50 via-white to-white dark:border-accent-800/40 dark:from-accent-950/40 dark:via-surface-900 dark:to-surface-900',
    iconWrap: 'bg-accent-500 text-white shadow-lg shadow-accent-500/30',
    accent: 'text-accent-600 dark:text-accent-400',
  },
  stat_activity: {
    icon: ActivityIcon,
    surface:
      'border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-white dark:border-blue-800/40 dark:from-blue-950/40 dark:via-surface-900 dark:to-surface-900',
    iconWrap: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
    accent: 'text-blue-600 dark:text-blue-400',
  },
};

const DEFAULT_THEME: StatTheme = {
  icon: ActivityIcon,
  surface:
    'border-stone-200 bg-gradient-to-br from-stone-50 via-white to-white dark:border-surface-600 dark:from-surface-700/50 dark:via-surface-900 dark:to-surface-900',
  iconWrap: 'bg-stone-500 text-white shadow-lg shadow-stone-500/20',
  accent: 'text-stone-600 dark:text-stone-400',
};

function resolveTheme(statId: string): StatTheme {
  return STAT_THEMES[statId] ?? DEFAULT_THEME;
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <article
      v-for="(stat, index) in stats.stats"
      :key="stat.id"
      :class="[
        'group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
        resolveTheme(stat.id).surface,
      ]"
      :style="{ animationDelay: `${index * 80}ms` }"
    >
      <div
        class="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/40 blur-2xl dark:bg-white/5"
        aria-hidden="true"
      />

      <div class="relative flex flex-wrap items-start justify-between gap-2">
        <div
          :class="[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            resolveTheme(stat.id).iconWrap,
          ]"
        >
          <component
            :is="resolveTheme(stat.id).icon"
            class="h-5 w-5"
          />
        </div>

        <Badge
          :variant="trendBadgeVariant(stat.trend)"
          size="sm"
          dot
          class="shrink-0"
        >
          {{ formatChange(stat.trend, stat.changePercent) }}
        </Badge>
      </div>

      <div class="relative mt-4">
        <Typography.Caption
          color="muted"
          class="uppercase tracking-wide"
        >
          {{ resolveLabel(stat.labelKey) }}
        </Typography.Caption>
        <p
          :class="[
            'mt-1 text-2xl font-bold tabular-nums tracking-tight text-stone-900 sm:text-3xl dark:text-white',
          ]"
        >
          {{ stat.value.toLocaleString() }}
        </p>
        <Typography.Caption :class="['mt-1 break-words', resolveTheme(stat.id).accent]">
          {{ stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→' }}
          {{ formatChange(stat.trend, stat.changePercent) }}
          {{ resolveLabel('dashboard.vsLastPeriod') }}
        </Typography.Caption>
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import CardSkeleton from '@/components/SkeletonLoader/CardSkeleton.vue';

export const DashboardStatsSkeleton = defineComponent({
  name: 'DashboardStatsSkeleton',
  setup() {
    return () =>
      h(
        'div',
        { class: 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3' },
        Array.from({ length: 3 }).map((_, i) =>
          h(CardSkeleton, { key: i, class: 'min-h-[148px]' }),
        ),
      );
  },
});
</script>
