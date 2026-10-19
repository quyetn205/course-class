export interface CategoryStat {
  id: number;
  name: string;
  courseCount: number;
}

export interface RecentUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  status: 'ACTIVE' | 'LOCKED';
  avatar?: string;
  createdAt: string;
}

export interface RecentCourse {
  id: number;
  title: string;
  instructorName: string;
  categoryName: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  thumbnailUrl?: string;
  createdAt: string;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  activeUsers: number;
  lockedUsers: number;

  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;

  totalClassrooms: number;
  totalCategories: number;
  totalLessons: number;

  totalEnrollments: number;
  totalSubmissions: number;
  totalQuizAttempts: number;

  categoryStats: CategoryStat[];
  recentUsers: RecentUser[];
  recentCourses: RecentCourse[];
}
