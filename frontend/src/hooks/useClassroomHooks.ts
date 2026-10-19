import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomApi } from '../api/classroomApi';
import type {
  ClassroomRequest, UpdateClassroomRequest, ClassroomFilterParams,
  AddStudentRequest, ClassroomStatus,
} from '../types/classroom';
import toast from 'react-hot-toast';

export const useClassrooms = (params?: ClassroomFilterParams) => {
  return useQuery({
    queryKey: ['classrooms', params],
    queryFn: () => classroomApi.getClassrooms(params).then(res => res.data.data),
  });
};

export const useClassroom = (id: number) => {
  return useQuery({
    queryKey: ['classroom', id],
    queryFn: () => classroomApi.getClassroom(id).then(res => res.data.data),
    enabled: !!id,
  });
};

export const useCreateClassroom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClassroomRequest) => classroomApi.createClassroom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      toast.success('Tạo lớp học thành công');
    },
  });
};

export const useUpdateClassroom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClassroomRequest }) =>
      classroomApi.updateClassroom(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      queryClient.invalidateQueries({ queryKey: ['classroom', variables.id] });
      toast.success('Cập nhật lớp học thành công');
    },
  });
};

export const useUpdateClassroomStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ClassroomStatus }) =>
      classroomApi.updateClassroomStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      queryClient.invalidateQueries({ queryKey: ['classroom', variables.id] });
      toast.success('Cập nhật trạng thái thành công');
    },
  });
};

export const useDeleteClassroom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classroomApi.deleteClassroom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      toast.success('Xóa lớp học thành công');
    },
  });
};

export const useClassroomStudents = (classId: number, params?: { page?: number; size?: number }) => {
  return useQuery({
    queryKey: ['classroom-students', classId, params],
    queryFn: () => classroomApi.getStudents(classId, params).then(res => res.data.data),
    enabled: !!classId,
  });
};

export const useAddStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, data }: { classId: number; data: AddStudentRequest }) =>
      classroomApi.addStudent(classId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classroom-students', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['classroom', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      toast.success('Thêm học viên thành công');
    },
  });
};

export const useRemoveStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: number; studentId: number }) =>
      classroomApi.removeStudent(classId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classroom-students', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['classroom', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      toast.success('Xóa học viên thành công');
    },
  });
};
