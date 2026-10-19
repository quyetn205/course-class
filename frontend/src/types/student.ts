export interface ResumeLessonDto {
  classId: number;
  className: string;
  courseId: number;
  courseTitle: string;
  lessonId: number;
  lessonTitle: string;
  lessonType: 'TEXT' | 'PDF' | 'VIDEO';
  chapterOrderNo: number;
  lessonOrderNo: number;
  classProgressPercent: number;
}

export interface UpcomingDeadlineDto {
  id: number;
  type: string;
  title: string;
  classId: number;
  className: string;
  courseId: number;
  courseTitle: string;
  lessonId: number;
  deadline: string;
  maxScore: number;
  isSubmitted: boolean;
  status: string;
  score?: number;
}

export interface RecentGradeDto {
  id: number;
  type: 'ASSIGNMENT' | 'QUIZ';
  title: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  feedback?: string;
}

export interface StudentClassDto {
  classId: number;
  className: string;
  courseId: number;
  courseTitle: string;
  instructorName: string;
  status: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  startDate?: string;
  endDate?: string;
}

export interface StudentDashboardResponse {
  totalEnrolledClasses: number;
  inProgressClasses: number;
  completedLessons: number;
  totalLessons: number;
  overallProgressPercent: number;

  totalSubmissions: number;
  totalQuizAttempts: number;
  averageScore?: number;

  resumeLearning?: ResumeLessonDto;
  upcomingDeadlines: UpcomingDeadlineDto[];
  recentGrades: RecentGradeDto[];
  myClasses: StudentClassDto[];
}
