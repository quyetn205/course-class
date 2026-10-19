import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common';
import type { AdminDashboardResponse } from '../types/admin';

export const adminApi = {
  getDashboardStats: () =>
    axiosClient.get<ApiResponse<AdminDashboardResponse>>('/api/admin/dashboard'),
};
