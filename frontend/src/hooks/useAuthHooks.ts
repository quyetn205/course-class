import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { LoginRequest } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      const userData = res.data.data;
      login(userData);
      toast.success('Đăng nhập thành công');

      switch (userData.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'INSTRUCTOR':
          navigate('/instructor');
          break;
        case 'STUDENT':
          navigate('/student');
          break;
      }
    },
  });
};
