import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common';
import type { CategoryResponse, CategoryRequest } from '../types/course';

export const categoryApi = {
  getAll: () =>
    axiosClient.get<ApiResponse<CategoryResponse[]>>('/api/categories'),

  create: (data: CategoryRequest) =>
    axiosClient.post<ApiResponse<CategoryResponse>>('/api/categories', data),

  update: (id: number, data: CategoryRequest) =>
    axiosClient.put<ApiResponse<CategoryResponse>>(`/api/categories/${id}`, data),

  delete: (id: number) =>
    axiosClient.delete<ApiResponse<void>>(`/api/categories/${id}`),
};
