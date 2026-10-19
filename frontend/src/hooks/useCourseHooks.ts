import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../api/courseApi';
import type { CourseRequest, ChapterRequest, LessonRequest } from '../types/course';
import toast from 'react-hot-toast';

// --- Course hooks ---
export const useCourses = (params?: {
  instructorId?: number; categoryId?: number; status?: string;
  page?: number; size?: number;
}) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseApi.getCourses(params).then(res => res.data.data),
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CourseRequest) => courseApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Tạo khóa học thành công');
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CourseRequest }) => courseApi.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Cập nhật khóa học thành công');
    },
  });
};

export const usePublishCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => courseApi.publishCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Xuất bản khóa học thành công');
    },
  });
};

export const useCloneCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: number; title?: string }) =>
      courseApi.cloneCourse(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Nhân bản khóa học thành công!');
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => courseApi.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-dashboard'] });
      toast.success('Xóa khóa học thành công');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Không thể xóa khóa học đã có lớp học hoặc dữ liệu liên kết.';
      toast.error(msg);
    },
  });
};

// --- Chapter hooks ---
export const useCreateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: number; data: ChapterRequest }) =>
      courseApi.createChapter(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Tạo chương thành công');
    },
  });
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ChapterRequest }) =>
      courseApi.updateChapter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Cập nhật chương thành công');
    },
  });
};

export const useDeleteChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => courseApi.deleteChapter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Xóa chương thành công');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Không thể xóa chương học.';
      toast.error(msg);
    },
  });
};

// --- Lesson hooks ---
export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: number; data: LessonRequest }) =>
      courseApi.createLesson(chapterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Tạo bài học thành công');
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LessonRequest }) =>
      courseApi.updateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Cập nhật bài học thành công');
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => courseApi.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Xóa bài học thành công');
    },
  });
};

export const useLesson = (id: number) => {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: () => courseApi.getLesson(id).then((res) => res.data.data),
    enabled: !!id,
  });
};
