import { useQuery } from '@tanstack/react-query';
import { gradebookApi } from '../api/gradebookApi';
import type { ClassGradebookResponse, StudentGradebookResponse } from '../types/gradebook';

export const useClassGradebook = (classId: number) => {
  return useQuery<ClassGradebookResponse>({
    queryKey: ['class-gradebook', classId],
    queryFn: () => gradebookApi.getClassGradebook(classId).then((res) => res.data.data),
    enabled: !!classId,
  });
};

export const useStudentGradebook = (classId: number) => {
  return useQuery<StudentGradebookResponse>({
    queryKey: ['student-gradebook', classId],
    queryFn: () => gradebookApi.getStudentGradebook(classId).then((res) => res.data.data),
    enabled: !!classId,
  });
};
