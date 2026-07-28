<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useDashboardStore } from '@/features/dashboard/stores/dashboardStore';
import { useLocale } from '@/locales/localeStore';
import Avatar from '@/components/Avatar/Avatar.vue';
import { Button } from '@/components/Button';
import { Typography } from '@/components/Typography';
import { Divider } from '@/components/Layout';
import { SettingsIcon, UsersIcon } from '@/layouts/sidebar/components/SidebarIcons';
import DashboardStatsCards, {
  DashboardStatsSkeleton,
} from '@/features/dashboard/components/DashboardStatsCards.vue';
import DashboardCharts from '@/features/dashboard/components/DashboardCharts.vue';
import DashboardChartsSkeleton from '@/features/dashboard/components/DashboardChartsSkeleton.vue';
import DashboardHeroContext from '@/features/dashboard/components/DashboardHeroContext.vue';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const { t } = useLocale();

const { user } = storeToRefs(authStore);
const { stats, revenueChart, activityChart, userDistribution, isLoading, error } =
  storeToRefs(dashboardStore);

const quickActions = [
  {
    titleKey: 'nav.users',
    descriptionKey: 'dashboard.quickActions.users',
    href: '/users',
    icon: UsersIcon,
    accent:
      'border-blue-200/70 bg-gradient-to-br from-blue-50 to-white dark:border-blue-800/40 dark:from-blue-950/30 dark:to-surface-900',
    iconClass: 'bg-blue-500 text-white',
  },
  {
    titleKey: 'nav.settings',
    descriptionKey: 'dashboard.quickActions.settings',
    href: '/settings',
    icon: SettingsIcon,
    accent:
      'border-stone-200/70 bg-gradient-to-br from-stone-50 to-white dark:border-surface-600 dark:from-surface-700/50 dark:to-surface-900',
    iconClass: 'bg-surface-600 text-white dark:bg-stone-500',
  },
] as const;

const greetingName = computed(() => user.value?.fullName?.split(' ')[0] ?? '');

onMounted(() => {
  void dashboardStore.fetchDashboard();
});
</script>

<template>
  <div class="min-w-0 space-y-6">
    <section class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(17rem,22rem)] lg:gap-5">
      <div
        class="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-br from-white via-primary-50/50 to-stone-50 p-4 shadow-sm sm:p-6 lg:p-8 dark:border-surface-600 dark:from-surface-800 dark:via-surface-800 dark:to-surface-900"
      >
        <div
          class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-400/10 blur-2xl dark:bg-primary-400/15"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-accent-400/10 blur-3xl dark:bg-accent-400/10"
          aria-hidden="true"
        />

        <div class="relative flex min-w-0 items-start gap-3 sm:gap-4">
          <Avatar
            v-if="user"
            :src="user.avatarUrl"
            :name="user.fullName"
            size="md"
            presence="online"
            class="shrink-0 sm:hidden"
          />
          <Avatar
            v-if="user"
            :src="user.avatarUrl"
            :name="user.fullName"
            size="lg"
            presence="online"
            class="hidden shrink-0 sm:inline-flex"
          />
          <div class="min-w-0 flex-1">
            <Typography.Overline class="text-primary-600 dark:text-primary-400">
              {{ t('dashboard.heroEyebrow') }}
            </Typography.Overline>
            <h1
              class="mt-0.5 break-words text-xl font-bold leading-snug tracking-tight text-stone-900 sm:mt-1 sm:text-2xl lg:text-3xl dark:text-white"
            >
              {{ t('dashboard.welcome', { name: greetingName }) }}
            </h1>
            <Typography.Text
              class="mt-1.5 block max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300 [&_strong]:font-semibold [&_strong]:text-stone-800 dark:[&_strong]:text-stone-100"
            >
              <!-- eslint-disable-next-line vue/no-v-html -- trusted locale copy -->
              <span v-html="t('dashboard.heroSubtitle')" />
            </Typography.Text>
          </div>
        </div>
      </div>

      <div
        v-if="user"
        class="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-br from-stone-50 via-white to-primary-50/40 p-4 shadow-sm sm:p-6 dark:border-surface-600 dark:from-surface-900 dark:via-surface-800 dark:to-surface-800"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-400/10 blur-2xl"
          aria-hidden="true"
        />
        <div class="relative">
          <DashboardHeroContext :user="user" />
        </div>
      </div>
    </section>

    <div
      v-if="error"
      class="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/50 dark:bg-red-950/30"
    >
      <p class="text-sm text-red-700 dark:text-red-300">
        {{ t('dashboard.loadError') }}
      </p>
      <Button
        variant="outline"
        size="sm"
        @click="dashboardStore.fetchDashboard()"
      >
        {{ t('components.common.retry') }}
      </Button>
    </div>

    <template v-if="isLoading">
      <DashboardStatsSkeleton />
      <DashboardChartsSkeleton />
    </template>
    <template v-else-if="stats && revenueChart && activityChart && userDistribution">
      <DashboardStatsCards
        :stats="stats"
        :resolve-label="t"
      />

      <DashboardCharts
        :revenue-chart="revenueChart"
        :activity-chart="activityChart"
        :user-distribution="userDistribution"
        :resolve-label="t"
      />

      <div>
        <Divider plain>
          <Typography.Overline>{{ t('dashboard.quickActions.title') }}</Typography.Overline>
        </Divider>

        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RouterLink
            v-for="action in quickActions"
            :key="action.href"
            :to="action.href"
            :class="[
              'group flex flex-col rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
              action.accent,
            ]"
          >
            <div
              :class="[
                'mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                action.iconClass,
              ]"
            >
              <component
                :is="action.icon"
                class="h-5 w-5"
              />
            </div>
            <Typography.Text
              weight="semibold"
              class="text-stone-900 dark:text-white"
            >
              {{ t(action.titleKey) }}
            </Typography.Text>
            <Typography.Caption
              color="muted"
              class="mt-1"
            >
              {{ t(action.descriptionKey) }}
            </Typography.Caption>
            <span
              class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400"
            >
              {{ t('dashboard.quickActions.open') }}
              <svg
                class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>
