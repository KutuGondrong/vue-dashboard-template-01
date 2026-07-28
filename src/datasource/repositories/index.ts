/**
 * Data access layer — usecases import from here, not from components or stores directly.
 * Swap mock (apiRepository) for HTTP (apiSource) when backend is ready.
 */
import { apiRepository } from '@/datasource/network/apiRepository';

export const authRepository = {
  login: apiRepository.login.bind(apiRepository),
  register: apiRepository.register.bind(apiRepository),
  logout: apiRepository.logout.bind(apiRepository),
};

export const usersRepository = {
  getUsers: apiRepository.getUsers.bind(apiRepository),
};

export const ordersRepository = {
  getOrders: apiRepository.getOrders.bind(apiRepository),
};

export const dashboardRepository = {
  getDashboardStats: apiRepository.getDashboardStats.bind(apiRepository),
  getRevenueChart: apiRepository.getRevenueChart.bind(apiRepository),
  getActivityChart: apiRepository.getActivityChart.bind(apiRepository),
  getUserDistributionChart: apiRepository.getUserDistributionChart.bind(apiRepository),
};
