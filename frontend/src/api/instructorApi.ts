import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common';
import type { InstructorDashboardResponse } from '../types/instructor';

export const instructorApi = {
  getDashboardStats: () =>
    axiosClient.get<ApiResponse<InstructorDashboardResponse>>('/api/instructor/dashboard'),
};
