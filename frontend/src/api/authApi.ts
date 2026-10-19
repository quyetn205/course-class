import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common';
import type { LoginRequest, LoginResponse } from '../types/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    axiosClient.post<ApiResponse<LoginResponse>>('/api/auth/login', data),
};
