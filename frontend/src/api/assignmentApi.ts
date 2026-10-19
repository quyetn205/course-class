import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse } from '../types/common';
import type {
  AssignmentResponse, AssignmentRequest,
  SubmissionResponse, SubmissionRequest, GradeSubmissionRequest,
} from '../types/assignment';

export const assignmentApi = {
  createAssignment: (lessonId: number, data: AssignmentRequest) =>
    axiosClient.post<ApiResponse<AssignmentResponse>>(`/api/lessons/${lessonId}/assignment`, data),

  getAssignmentByLessonId: (lessonId: number) =>
    axiosClient.get<ApiResponse<AssignmentResponse>>(`/api/lessons/${lessonId}/assignment`),

  deleteAssignment: (assignmentId: number) =>
    axiosClient.delete<ApiResponse<void>>(`/api/assignments/${assignmentId}`),

  getSubmissions: (assignmentId: number, params?: { page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<PageResponse<SubmissionResponse>>>(`/api/assignments/${assignmentId}/submissions`, { params }),

  submitAssignment: (assignmentId: number, data: SubmissionRequest) =>
    axiosClient.post<ApiResponse<SubmissionResponse>>(`/api/assignments/${assignmentId}/submissions`, data),

  getMySubmission: (assignmentId: number) =>
    axiosClient.get<ApiResponse<SubmissionResponse>>(`/api/assignments/${assignmentId}/my-submission`),

  gradeSubmission: (submissionId: number, data: GradeSubmissionRequest) =>
    axiosClient.put<ApiResponse<SubmissionResponse>>(`/api/submissions/${submissionId}/grade`, data),
};
