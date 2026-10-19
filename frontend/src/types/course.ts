export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

export type CourseStatus = 'DRAFT' | 'PUBLISHED';

export interface CourseResponse {
  id: number;
  title: string;
  description: string | null;
  goal: string | null;
  categoryId: number;
  categoryName: string;
  instructorId: number;
  instructorName: string;
  status: CourseStatus;
  createdAt: string;
  updatedAt?: string;
  thumbnailUrl?: string | null;
  level?: string;
  prerequisites?: string | null;
  chapters: ChapterResponse[];
}

export interface CourseRequest {
  title: string;
  description?: string;
  goal?: string;
  categoryId: number;
  thumbnailUrl?: string;
  level?: string;
  prerequisites?: string;
}

export interface ChapterResponse {
  id: number;
  courseId: number;
  title: string;
  orderNo: number;
  lessons: LessonResponse[];
}

export interface ChapterRequest {
  title: string;
  orderNo: number;
}

export interface LessonResponse {
  id: number;
  chapterId: number;
  title: string;
  content: string | null;
  orderNo: number;
  locked: boolean;
  lessonType?: 'TEXT' | 'PDF' | 'VIDEO';
  fileUrl?: string | null;
  fileName?: string | null;
  videoUrl?: string | null;
  duration?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonRequest {
  title: string;
  content?: string;
  orderNo: number;
  lessonType?: 'TEXT' | 'PDF' | 'VIDEO';
  fileUrl?: string;
  fileName?: string;
  videoUrl?: string;
  duration?: number;
}
