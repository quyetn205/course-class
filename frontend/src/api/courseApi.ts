import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse } from '../types/common';
import type {
  CourseResponse, CourseRequest,
  ChapterResponse, ChapterRequest,
  LessonResponse, LessonRequest,
} from '../types/course';

export const courseApi = {
  // --- Course ---
  getCourses: (params?: {
    instructorId?: number; categoryId?: number; status?: string;
    page?: number; size?: number;
  }) =>
    axiosClient.get<ApiResponse<PageResponse<CourseResponse>>>('/api/courses', { params }),

  createCourse: (data: CourseRequest) =>
    axiosClient.post<ApiResponse<CourseResponse>>('/api/courses', data),

  updateCourse: (id: number, data: CourseRequest) =>
    axiosClient.put<ApiResponse<CourseResponse>>(`/api/courses/${id}`, data),

  publishCourse: (id: number) =>
    axiosClient.patch<ApiResponse<CourseResponse>>(`/api/courses/${id}/publish`),

  cloneCourse: (id: number, data?: { title?: string }) =>
    axiosClient.post<ApiResponse<CourseResponse>>(`/api/courses/${id}/clone`, data || {}),

  deleteCourse: (id: number) =>
    axiosClient.delete<ApiResponse<void>>(`/api/courses/${id}`),

  // --- Chapter ---
  createChapter: (courseId: number, data: ChapterRequest) =>
    axiosClient.post<ApiResponse<ChapterResponse>>(`/api/courses/${courseId}/chapters`, data),

  updateChapter: (id: number, data: ChapterRequest) =>
    axiosClient.put<ApiResponse<ChapterResponse>>(`/api/chapters/${id}`, data),

  deleteChapter: (id: number) =>
    axiosClient.delete<ApiResponse<void>>(`/api/chapters/${id}`),

  // --- Lesson ---
  createLesson: (chapterId: number, data: LessonRequest) =>
    axiosClient.post<ApiResponse<LessonResponse>>(`/api/chapters/${chapterId}/lessons`, data),

  updateLesson: (id: number, data: LessonRequest) =>
    axiosClient.put<ApiResponse<LessonResponse>>(`/api/lessons/${id}`, data),

  getLesson: (id: number) =>
    axiosClient.get<ApiResponse<LessonResponse>>(`/api/lessons/${id}`),

  deleteLesson: (id: number) =>
    axiosClient.delete<ApiResponse<void>>(`/api/lessons/${id}`),
};
