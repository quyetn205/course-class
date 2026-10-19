import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common';
import type { ClassGradebookResponse, StudentGradebookResponse } from '../types/gradebook';

export const gradebookApi = {
  getClassGradebook: (classId: number) =>
    axiosClient.get<ApiResponse<ClassGradebookResponse>>(`/api/classes/${classId}/gradebook`),

  getStudentGradebook: (classId: number) =>
    axiosClient.get<ApiResponse<StudentGradebookResponse>>(`/api/classes/${classId}/my-grades`),
};
