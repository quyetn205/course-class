import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common';
import type { FileUploadResponse } from '../types/file';

export const fileApi = {
  uploadFile: async (file: File, folder = 'lessons'): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await axiosClient.post<ApiResponse<FileUploadResponse>>('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  deleteFile: async (fileUrl: string): Promise<void> => {
    await axiosClient.delete('/api/files', {
      params: { fileUrl },
    });
  },
};
