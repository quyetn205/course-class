import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { CategoryManagement } from './pages/admin/CategoryManagement';
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { CourseManagement } from './pages/instructor/CourseManagement';
import { ClassManagement } from './pages/instructor/ClassManagement';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyClasses } from './pages/student/MyClasses';
import { CourseProgress } from './pages/student/CourseProgress';
import { LessonWorkspace } from './pages/student/LessonWorkspace';
import { NotFoundPage } from './pages/common/NotFoundPage';
import { ProfilePage } from './pages/common/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR', 'STUDENT']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/admin', element: <AdminDashboard /> },
          { path: '/admin/users', element: <UserManagement /> },
          { path: '/admin/categories', element: <CategoryManagement /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['INSTRUCTOR']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/instructor', element: <InstructorDashboard /> },
          { path: '/instructor/courses', element: <CourseManagement /> },
          { path: '/instructor/classes', element: <ClassManagement /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['STUDENT']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/student', element: <StudentDashboard /> },
          { path: '/student/classes', element: <MyClasses /> },
          { path: '/student/classes/:classId/progress', element: <CourseProgress /> },
          { path: '/student/progress', element: <MyClasses /> },
        ],
      },
      // Trang học tập chuyên biệt toàn màn hình chuẩn LMS (Coursera/Udemy style)
      { path: '/student/classes/:classId/learn/:lessonId', element: <LessonWorkspace /> },
    ],
  },
]);
