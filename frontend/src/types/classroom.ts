export type ClassroomStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface ClassroomResponse {
  id: number;
  courseId: number;
  courseName: string;
  instructorId: number;
  instructorName: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  maxStudents: number;
  currentStudents: number;
  status: ClassroomStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassroomRequest {
  courseId: number;
  name: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
}

export interface UpdateClassroomRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  status?: ClassroomStatus;
}

export interface ClassroomFilterParams {
  instructorId?: number;
  courseId?: number;
  status?: ClassroomStatus;
  search?: string;
  page?: number;
  size?: number;
}

export interface AddStudentRequest {
  studentId: number;
}

export interface EnrollmentResponse {
  id: number;
  classId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  enrolledDate: string;
}
