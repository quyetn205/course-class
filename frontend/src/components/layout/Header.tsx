import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { API_BASE_URL } from '../../api/axiosClient';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();

  const userAvatarUrl = user?.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${API_BASE_URL}${user.avatar}`
    : null;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 hidden sm:block">
          LMS System
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors group cursor-pointer"
          title="Xem hồ sơ & Đổi mật khẩu"
        >
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {user?.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role}
            </span>
          </div>
          {userAvatarUrl ? (
            <img
              src={userAvatarUrl}
              alt={user?.name || 'User'}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/30 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
            </div>
          )}
        </Link>
        
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
        
        <Button variant="ghost" size="sm" onClick={logout} className="text-danger hover:bg-danger/10 hover:text-danger">
          <LogOut className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    </header>
  );
};
