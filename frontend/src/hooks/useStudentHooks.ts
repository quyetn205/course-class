import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../api/studentApi';
import toast from 'react-hot-toast';

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => studentApi.getDashboard().then((res) => res.data.data),
    staleTime: 60 * 1000,
  });
};

export const useMyClasses = () => {
  return useQuery({
    queryKey: ['my-classes'],
    queryFn: () => studentApi.getMyClasses().then((res) => res.data.data),
  });
};

export const useCourseProgress = (courseId: number) => {
  return useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => studentApi.getCourseProgress(courseId).then((res) => res.data.data),
    enabled: !!courseId,
  });
};

export const useCompleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: number) => studentApi.completeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      toast.success('Hoàn thành bài học');
    },
  });
};
