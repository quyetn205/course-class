export interface QuizResponse {
  id: number;
  lessonId: number;
  title: string;
  questions: QuestionResponse[];
}

export interface QuizRequest {
  title: string;
}

export interface QuestionResponse {
  id: number;
  content: string;
  options: OptionResponse[];
}

export interface QuestionRequest {
  content: string;
  options?: OptionRequest[];
}

export interface OptionResponse {
  id: number;
  content: string;
  isCorrect: boolean;
}

export interface OptionRequest {
  content: string;
  isCorrect: boolean;
}

export interface QuizAttemptRequest {
  answers: { questionId: number; selectedOptionId: number }[];
}

export interface QuizAttemptAnswerResponse {
  id: number;
  questionId: number;
  questionContent: string;
  selectedOptionId?: number | null;
  selectedOptionContent?: string | null;
  correctOptionId?: number | null;
  correctOptionContent?: string | null;
  isCorrect: boolean;
  options?: OptionResponse[];
}

export interface QuizAttemptResponse {
  id: number;
  quizId: number;
  quizTitle: string;
  studentId: number;
  studentName: string;
  studentEmail?: string;
  score: number;
  totalQuestions?: number;
  correctCount?: number;
  submittedAt: string;
  answers?: QuizAttemptAnswerResponse[];
}
