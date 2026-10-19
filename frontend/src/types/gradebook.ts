export interface GradebookItemColumn {
  id: number;
  title: string;
  lessonTitle: string;
  maxScore: number;
}

export interface QuizScoreItem {
  score?: number | null;
  correctCount?: number | null;
  totalQuestions?: number | null;
  submittedAt?: string | null;
}

export interface AssignmentScoreItem {
  score?: number | null;
  maxScore?: number | null;
  status?: string | null;
  comment?: string | null;
  submittedAt?: string | null;
}

export interface StudentGradeRow {
  studentId: number;
  studentName: string;
  studentEmail: string;
  completedLessons: number;
  progressPercentage: number;
  quizScores: { [quizId: number]: QuizScoreItem };
  assignmentScores: { [assignmentId: number]: AssignmentScoreItem };
  averageScore?: number | null;
}

export interface ClassGradebookResponse {
  classId: number;
  className: string;
  courseId: number;
  courseName: string;
  instructorName: string;
  totalLessons: number;
  quizzes: GradebookItemColumn[];
  assignments: GradebookItemColumn[];
  studentRows: StudentGradeRow[];
}

export interface StudentGradeItem {
  type: 'QUIZ' | 'ASSIGNMENT';
  itemId: number;
  title: string;
  lessonTitle: string;
  score?: number | null;
  maxScore: number;
  status: 'COMPLETED' | 'SUBMITTED' | 'GRADED' | 'NOT_STARTED';
  correctCount?: number | null;
  totalQuestions?: number | null;
  comment?: string | null;
  submittedAt?: string | null;
}

export interface StudentGradebookResponse {
  classId: number;
  className: string;
  courseId: number;
  courseName: string;
  instructorName: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  overallAverageScore?: number | null;
  items: StudentGradeItem[];
}
