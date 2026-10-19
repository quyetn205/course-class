import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse } from '../types/common';
import type { 
  UserResponse, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UpdateStatusRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ResetPasswordRequest
} from '../types/user';

export const userApi = {
  getUsers: (params?: { role?: string; status?: string; keyword?: string; page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<PageResponse<UserResponse>>>('/api/users', { params }),

  createUser: (data: CreateUserRequest) =>
    axiosClient.post<ApiResponse<UserResponse>>('/api/users', data),

  updateUser: (id: number, data: UpdateUserRequest) =>
    axiosClient.put<ApiResponse<UserResponse>>(`/api/users/${id}`, data),

  updateStatus: (id: number, data: UpdateStatusRequest) =>
    axiosClient.patch<ApiResponse<UserResponse>>(`/api/users/${id}/status`, data),

  getProfile: () =>
    axiosClient.get<ApiResponse<UserResponse>>('/api/users/profile'),

  updateProfile: (data: UpdateProfileRequest) =>
    axiosClient.put<ApiResponse<UserResponse>>('/api/users/profile', data),

  changePassword: (data: ChangePasswordRequest) =>
    axiosClient.post<ApiResponse<void>>('/api/users/change-password', data),

  resetPassword: (id: number, data?: ResetPasswordRequest) =>
    axiosClient.post<ApiResponse<void>>(`/api/users/${id}/reset-password`, data || {}),
};
