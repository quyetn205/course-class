import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentApi } from '../api/assignmentApi';
import type { AssignmentRequest, SubmissionRequest, GradeSubmissionRequest } from '../types/assignment';
import toast from 'react-hot-toast';

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: number; data: AssignmentRequest }) =>
      assignmentApi.createAssignment(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Tạo bài tập thành công');
    },
  });
};

export const useSubmissions = (assignmentId: number, params?: { page?: number; size?: number }) => {
  return useQuery({
    queryKey: ['submissions', assignmentId, params],
    queryFn: () => assignmentApi.getSubmissions(assignmentId, params).then(res => res.data.data),
    enabled: !!assignmentId,
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: number; data: SubmissionRequest }) =>
      assignmentApi.submitAssignment(assignmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['submissions', variables.assignmentId] });
      toast.success('Nộp bài tập thành công');
    },
  });
};

export const useLessonAssignment = (lessonId: number) => {
  return useQuery({
    queryKey: ['lesson-assignment', lessonId],
    queryFn: () => assignmentApi.getAssignmentByLessonId(lessonId).then(res => res.data.data),
    enabled: !!lessonId,
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) => assignmentApi.deleteAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Xóa bài tập thành công');
    },
  });
};

export const useMySubmission = (assignmentId: number) => {
  return useQuery({
    queryKey: ['my-submission', assignmentId],
    queryFn: () => assignmentApi.getMySubmission(assignmentId).then(res => res.data.data),
    enabled: !!assignmentId,
  });
};

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: number; data: GradeSubmissionRequest }) =>
      assignmentApi.gradeSubmission(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Chấm điểm thành công');
    },
  });
};
