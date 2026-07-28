import { dashboardRepository } from '@/datasource/repositories';
import {
  toBarChartData,
  toDashboardStats,
  toDonutChartData,
  toLineChartData,
} from '@/models/model.map';
import type {
  BarChartData,
  DashboardStats,
  DonutChartData,
  LineChartData,
} from '@/models/model.type';

export const dashboardUsecase = {
  async getStats(): Promise<DashboardStats> {
    const response = await dashboardRepository.getDashboardStats();
    return toDashboardStats(response);
  },

  async getRevenueChart(): Promise<LineChartData> {
    const response = await dashboardRepository.getRevenueChart();
    return toLineChartData(response);
  },

  async getActivityChart(): Promise<BarChartData> {
    const response = await dashboardRepository.getActivityChart();
    return toBarChartData(response);
  },

  async getUserDistribution(): Promise<DonutChartData> {
    const response = await dashboardRepository.getUserDistributionChart();
    return toDonutChartData(response);
  },
};
