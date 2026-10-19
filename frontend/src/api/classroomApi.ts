import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse } from '../types/common';
import type {
  ClassroomResponse, ClassroomRequest, UpdateClassroomRequest, ClassroomFilterParams,
  EnrollmentResponse, AddStudentRequest, ClassroomStatus,
} from '../types/classroom';

export const classroomApi = {
  getClassrooms: (params?: ClassroomFilterParams) =>
    axiosClient.get<ApiResponse<PageResponse<ClassroomResponse>>>('/api/classes', { params }),

  createClassroom: (data: ClassroomRequest) =>
    axiosClient.post<ApiResponse<ClassroomResponse>>('/api/classes', data),

  getClassroom: (id: number) =>
    axiosClient.get<ApiResponse<ClassroomResponse>>(`/api/classes/${id}`),

  updateClassroom: (id: number, data: UpdateClassroomRequest) =>
    axiosClient.put<ApiResponse<ClassroomResponse>>(`/api/classes/${id}`, data),

  updateClassroomStatus: (id: number, status: ClassroomStatus) =>
    axiosClient.patch<ApiResponse<ClassroomResponse>>(`/api/classes/${id}/status`, null, { params: { status } }),

  deleteClassroom: (id: number) =>
    axiosClient.delete<ApiResponse<void>>(`/api/classes/${id}`),

  addStudent: (classId: number, data: AddStudentRequest) =>
    axiosClient.post<ApiResponse<EnrollmentResponse>>(`/api/classes/${classId}/students`, data),

  removeStudent: (classId: number, studentId: number) =>
    axiosClient.delete<ApiResponse<void>>(`/api/classes/${classId}/students/${studentId}`),

  getStudents: (classId: number, params?: { page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<PageResponse<EnrollmentResponse>>>(`/api/classes/${classId}/students`, { params }),
};
