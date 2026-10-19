import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '../api/quizApi';
import type { QuizRequest, QuestionRequest, OptionRequest, QuizAttemptRequest } from '../types/quiz';
import toast from 'react-hot-toast';

export const useQuiz = (quizId: number) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizApi.getQuiz(quizId).then(res => res.data.data),
    enabled: !!quizId,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: number; data: QuizRequest }) =>
      quizApi.createQuiz(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Tạo quiz thành công');
    },
  });
};

export const useAddQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: number; data: QuestionRequest }) =>
      quizApi.addQuestion(quizId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      toast.success('Thêm câu hỏi thành công');
    },
  });
};

export const useAddOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: number; data: OptionRequest }) =>
      quizApi.addOption(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
      toast.success('Thêm lựa chọn thành công');
    },
  });
};

export const useLessonQuiz = (lessonId: number) => {
  return useQuery({
    queryKey: ['lesson-quiz', lessonId],
    queryFn: () => quizApi.getQuizByLessonId(lessonId).then(res => res.data.data),
    enabled: !!lessonId,
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quizId: number) => quizApi.deleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-quiz'] });
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Xóa quiz thành công');
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId }: { questionId: number; quizId?: number; lessonId?: number }) =>
      quizApi.deleteQuestion(questionId),
    onSuccess: (_, vars) => {
      if (vars.quizId) queryClient.invalidateQueries({ queryKey: ['quiz', vars.quizId] });
      if (vars.lessonId) queryClient.invalidateQueries({ queryKey: ['lesson-quiz', vars.lessonId] });
      toast.success('Xóa câu hỏi thành công');
    },
  });
};

export const useMyQuizAttempt = (quizId: number) => {
  return useQuery({
    queryKey: ['quiz-my-attempt', quizId],
    queryFn: () => quizApi.getMyAttempt(quizId).then(res => res.data.data),
    enabled: !!quizId,
  });
};

export const useSubmitQuizAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: number; data: QuizAttemptRequest }) =>
      quizApi.submitAttempt(quizId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-my-attempt', vars.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', vars.quizId] });
      toast.success('Nộp bài quiz thành công');
    },
  });
};

export const useQuizAttempts = (quizId: number) => {
  return useQuery({
    queryKey: ['quiz-attempts', quizId],
    queryFn: () => quizApi.getQuizAttempts(quizId).then(res => res.data.data),
    enabled: !!quizId,
  });
};

export const useAttemptDetail = (attemptId: number) => {
  return useQuery({
    queryKey: ['quiz-attempt-detail', attemptId],
    queryFn: () => quizApi.getAttemptDetail(attemptId).then(res => res.data.data),
    enabled: !!attemptId,
  });
};
