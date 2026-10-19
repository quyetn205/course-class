// No imports needed
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  BookOpen, 
  GraduationCap, 
  PieChart, 
  X,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const { user } = useAuth();
  const role = user?.role;

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Quản lý tài khoản', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Quản lý danh mục', path: '/admin/categories', icon: <FolderOpen className="w-5 h-5" /> },
  ];

  const instructorLinks = [
    { name: 'Dashboard', path: '/instructor', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Khóa học', path: '/instructor/courses', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Lớp học', path: '/instructor/classes', icon: <GraduationCap className="w-5 h-5" /> },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Lớp học của tôi', path: '/student/classes', icon: <GraduationCap className="w-5 h-5" /> },
    { name: 'Tiến độ học tập', path: '/student/progress', icon: <PieChart className="w-5 h-5" /> },
  ];

  const links = 
    role === 'ADMIN' ? adminLinks : 
    role === 'INSTRUCTOR' ? instructorLinks : 
    studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">LMS System</span>
          <button onClick={closeSidebar} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/admin' || link.path === '/instructor' || link.path === '/student'}
              onClick={() => {
                if (window.innerWidth < 1024) closeSidebar();
              }}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              <span className="mr-3">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-750">
          <NavLink
            to="/profile"
            onClick={() => {
              if (window.innerWidth < 1024) closeSidebar();
            }}
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                isActive 
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            <User className="w-5 h-5 mr-3 text-primary-500" />
            Hồ sơ & Đổi mật khẩu
          </NavLink>
        </div>
      </aside>
    </>
  );
};
