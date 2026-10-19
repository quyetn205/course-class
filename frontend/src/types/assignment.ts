export interface AssignmentResponse {
  id: number;
  lessonId: number;
  title: string;
  deadline: string | null;
  maxScore: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentRequest {
  title: string;
  deadline?: string;
  maxScore?: number;
}

export type SubmissionStatus = 'SUBMITTED' | 'GRADED';

export interface SubmissionResponse {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: number;
  studentName: string;
  file: string | null;
  status: SubmissionStatus;
  score: number | null;
  comment: string | null;
  submittedAt?: string | null;
  updatedAt?: string;
  isLate?: boolean;
}

export interface SubmissionRequest {
  file?: string;
}

export interface GradeSubmissionRequest {
  score: number;
  comment?: string;
}

export type LessonProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface LessonProgressResponse {
  id: number | null;
  lessonId: number;
  lessonTitle: string;
  studentId: number;
  status: LessonProgressStatus;
  completedAt: string | null;
  lessonContent?: string | null;
  lessonType?: 'TEXT' | 'PDF' | 'VIDEO';
  fileUrl?: string | null;
  fileName?: string | null;
  orderNo?: number;
  videoUrl?: string | null;
  duration?: number | null;
}
