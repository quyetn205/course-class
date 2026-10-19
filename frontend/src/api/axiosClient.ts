import axios from 'axios';
import toast from 'react-hot-toast';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;
      // Nếu là request login thất bại, thông báo lỗi đăng nhập cụ thể, không redirect
      if (config?.url?.includes('/api/auth/login')) {
        toast.error(data?.message || 'Email hoặc mật khẩu không chính xác');
        return Promise.reject(error);
      }
      if (status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
          toast.error('Phiên đăng nhập hết hạn');
        }
      } else if (status === 403) {
        toast.error('Bạn không có quyền truy cập');
      } else {
        toast.error(data?.message || 'Đã có lỗi xảy ra');
      }
    } else {
      toast.error('Không thể kết nối đến máy chủ');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
