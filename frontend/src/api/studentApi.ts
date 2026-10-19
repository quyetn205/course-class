import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common';
import type { ClassroomResponse } from '../types/classroom';
import type { LessonProgressResponse } from '../types/assignment';
import type { StudentDashboardResponse } from '../types/student';

export const studentApi = {
  getDashboard: () =>
    axiosClient.get<ApiResponse<StudentDashboardResponse>>('/api/students/me/dashboard'),

  getMyClasses: () =>
    axiosClient.get<ApiResponse<ClassroomResponse[]>>('/api/students/me/classes'),

  getCourseProgress: (courseId: number) =>
    axiosClient.get<ApiResponse<LessonProgressResponse[]>>(`/api/students/me/courses/${courseId}/progress`),

  completeLesson: (lessonId: number) =>
    axiosClient.post<ApiResponse<LessonProgressResponse>>(`/api/lessons/${lessonId}/complete`),
};
