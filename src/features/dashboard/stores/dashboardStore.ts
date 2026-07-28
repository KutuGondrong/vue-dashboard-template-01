import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  BarChartData,
  DashboardStats,
  DonutChartData,
  LineChartData,
} from '@/models/model.type';
import { dashboardUsecase } from '@/features/dashboard/usecase/dashboardUsecase';

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null);
  const revenueChart = ref<LineChartData | null>(null);
  const activityChart = ref<BarChartData | null>(null);
  const userDistribution = ref<DonutChartData | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  async function fetchDashboard(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const [statsData, revenue, activity, distribution] = await Promise.all([
        dashboardUsecase.getStats(),
        dashboardUsecase.getRevenueChart(),
        dashboardUsecase.getActivityChart(),
        dashboardUsecase.getUserDistribution(),
      ]);
      stats.value = statsData;
      revenueChart.value = revenue;
      activityChart.value = activity;
      userDistribution.value = distribution;
    } catch {
      error.value = 'Failed to load dashboard data';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    stats,
    revenueChart,
    activityChart,
    userDistribution,
    isLoading,
    error,
    fetchDashboard,
  };
});
