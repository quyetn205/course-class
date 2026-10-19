import { useQuery } from '@tanstack/react-query';
import { instructorApi } from '../api/instructorApi';

export const useInstructorDashboard = () => {
  return useQuery({
    queryKey: ['instructor-dashboard'],
    queryFn: () => instructorApi.getDashboardStats().then((res) => res.data.data),
    staleTime: 60 * 1000,
  });
};
