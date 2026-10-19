export interface PendingSubmissionDto {
  submissionId: number;
  assignmentId: number;
  assignmentTitle: string;
  courseTitle: string;
  lessonTitle: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  fileUrl?: string;
  status: string;
  score?: number;
  maxScore?: number;
  submittedAt: string;
}

export interface InstructorClassDto {
  id: number;
  name: string;
  courseId: number;
  courseTitle: string;
  status: string;
  currentStudents: number;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
}

export interface InstructorCourseDto {
  id: number;
  title: string;
  categoryName?: string;
  status: string;
  thumbnailUrl?: string;
  chapterCount: number;
  createdAt: string;
}

export interface InstructorDashboardResponse {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;

  totalClassrooms: number;
  openClassrooms: number;
  inProgressClassrooms: number;
  closedClassrooms: number;

  totalStudents: number;

  pendingSubmissions: number;
  gradedSubmissions: number;
  totalSubmissions: number;
  totalQuizAttempts: number;

  recentSubmissions: PendingSubmissionDto[];
  myClasses: InstructorClassDto[];
  myCourses: InstructorCourseDto[];
}
