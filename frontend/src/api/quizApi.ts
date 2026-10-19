import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common';
import type {
  QuizResponse, QuizRequest,
  QuestionResponse, QuestionRequest,
  OptionResponse, OptionRequest,
  QuizAttemptResponse, QuizAttemptRequest,
} from '../types/quiz';

export const quizApi = {
  createQuiz: (lessonId: number, data: QuizRequest) =>
    axiosClient.post<ApiResponse<QuizResponse>>(`/api/lessons/${lessonId}/quiz`, data),

  getQuiz: (quizId: number) =>
    axiosClient.get<ApiResponse<QuizResponse>>(`/api/quizzes/${quizId}`),

  getQuizByLessonId: (lessonId: number) =>
    axiosClient.get<ApiResponse<QuizResponse>>(`/api/lessons/${lessonId}/quiz`),

  deleteQuiz: (quizId: number) =>
    axiosClient.delete<ApiResponse<void>>(`/api/quizzes/${quizId}`),

  addQuestion: (quizId: number, data: QuestionRequest) =>
    axiosClient.post<ApiResponse<QuestionResponse>>(`/api/quizzes/${quizId}/questions`, data),

  deleteQuestion: (questionId: number) =>
    axiosClient.delete<ApiResponse<void>>(`/api/questions/${questionId}`),

  addOption: (questionId: number, data: OptionRequest) =>
    axiosClient.post<ApiResponse<OptionResponse>>(`/api/questions/${questionId}/options`, data),

  submitAttempt: (quizId: number, data: QuizAttemptRequest) =>
    axiosClient.post<ApiResponse<QuizAttemptResponse>>(`/api/quizzes/${quizId}/attempts`, data),

  getMyAttempt: (quizId: number) =>
    axiosClient.get<ApiResponse<QuizAttemptResponse>>(`/api/quizzes/${quizId}/my-attempt`),

  getQuizAttempts: (quizId: number) =>
    axiosClient.get<ApiResponse<QuizAttemptResponse[]>>(`/api/quizzes/${quizId}/attempts`),

  getAttemptDetail: (attemptId: number) =>
    axiosClient.get<ApiResponse<QuizAttemptResponse>>(`/api/attempts/${attemptId}`),
};
