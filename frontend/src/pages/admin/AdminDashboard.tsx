import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  FolderOpen, 
  UserPlus, 
  PlusCircle, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAdminDashboard } from '../../hooks/useAdminHooks';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Không thể tải dữ liệu thống kê quản trị. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  // Tính phần trăm người dùng theo role
  const totalUsers = stats.totalUsers || 1;
  const studentPercent = Math.round((stats.totalStudents / totalUsers) * 100);
  const instructorPercent = Math.round((stats.totalInstructors / totalUsers) * 100);
  const adminPercent = Math.round((stats.totalAdmins / totalUsers) * 100);

  // Tính tổng tương tác
  const totalInteractions = stats.totalSubmissions + stats.totalQuizAttempts;

  // Lấy ngày hiện tại định dạng Việt Nam
  const todayFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Hệ thống vận hành ổn định
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trung tâm Quản trị Hệ thống
            </h1>
            <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
              Theo dõi toàn diện các chỉ số đào tạo, người dùng, tiến độ khóa học và tương tác học tập trực tuyến trên toàn hệ thống EduCore LMS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white">
              <span className="opacity-80 block text-[10px] uppercase tracking-wider font-semibold">Thời gian hệ thống</span>
              <span className="font-bold text-sm capitalize">{todayFormatted}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/admin/users')}
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-sm gap-2"
            >
              <UserPlus className="w-4 h-4 text-primary-600" />
              <span>Quản lý người dùng</span>
            </Button>
          </div>
        </div>

        {/* Trang trí nền background */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 4 Hero Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Người dùng */}
        <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tổng người dùng
              </span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              {stats.totalUsers.toLocaleString('vi-VN')}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300">
                {stats.totalStudents} Học sinh
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 font-semibold text-purple-700 dark:text-purple-300">
                {stats.totalInstructors} Giảng viên
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Card 2: Khóa học */}
        <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Khóa học hệ thống
              </span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              {stats.totalCourses.toLocaleString('vi-VN')}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 font-semibold text-emerald-700 dark:text-emerald-300">
                {stats.publishedCourses} Đã xuất bản
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 font-semibold text-amber-700 dark:text-amber-300">
                {stats.draftCourses} Bản nháp
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Card 3: Lớp học & Danh mục */}
        <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-emerald-500">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Lớp học & Ghi danh
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              {stats.totalClassrooms.toLocaleString('vi-VN')} <span className="text-sm font-semibold text-gray-500">lớp</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 font-semibold text-blue-700 dark:text-blue-300">
                {stats.totalEnrollments} Lượt ghi danh
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300">
                {stats.totalCategories} Danh mục
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Card 4: Tương tác học tập */}
        <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-amber-500">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tương tác học tập
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              {totalInteractions.toLocaleString('vi-VN')}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 font-semibold text-purple-700 dark:text-purple-300">
                {stats.totalQuizAttempts} Lượt Quiz
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 font-semibold text-emerald-700 dark:text-emerald-300">
                {stats.totalSubmissions} Bài nộp file
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Row 2: 2 Visual Insight Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột 1: Phân bổ tài khoản & Trạng thái hoạt động */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Cơ cấu Người dùng & Trạng thái
                </h2>
              </div>
              <Link to="/admin/users" className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1">
                Chi tiết <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Thanh tỷ lệ tổng hợp */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-gray-600 dark:text-gray-400">Tỷ lệ theo vai trò</span>
                <span className="text-gray-900 dark:text-white">{stats.totalUsers} tài khoản</span>
              </div>
              <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${studentPercent}%` }} 
                  title={`Học sinh: ${stats.totalStudents} (${studentPercent}%)`}
                />
                <div 
                  className="bg-purple-500 h-full transition-all duration-500" 
                  style={{ width: `${instructorPercent}%` }} 
                  title={`Giảng viên: ${stats.totalInstructors} (${instructorPercent}%)`}
                />
                <div 
                  className="bg-rose-500 h-full transition-all duration-500" 
                  style={{ width: `${adminPercent}%` }} 
                  title={`Admin: ${stats.totalAdmins} (${adminPercent}%)`}
                />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Học sinh</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.totalStudents} <span className="text-xs font-normal text-gray-400">({studentPercent}%)</span>
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Giảng viên</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.totalInstructors} <span className="text-xs font-normal text-gray-400">({instructorPercent}%)</span>
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Quản trị viên</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.totalAdmins} <span className="text-xs font-normal text-gray-400">({adminPercent}%)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Trạng thái tài khoản */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Tài khoản hoạt động</p>
                  <p className="text-xs text-gray-500">Đang có thể đăng nhập bình thường</p>
                </div>
              </div>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.activeUsers}
              </span>
            </div>

            {stats.lockedUsers > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-rose-900 dark:text-rose-200">Tài khoản bị khóa</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400">Bị vô hiệu hóa bởi quản trị viên</p>
                  </div>
                </div>
                <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                  {stats.lockedUsers}
                </span>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Cột 2: Khóa học theo danh mục */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Khóa học theo Danh mục đào tạo
                </h2>
              </div>
              <Link to="/admin/categories" className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1">
                Quản lý danh mục <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {stats.categoryStats && stats.categoryStats.length > 0 ? (
              stats.categoryStats.map((cat) => {
                const maxCourses = Math.max(...stats.categoryStats.map(c => c.courseCount), 1);
                const percent = Math.round((cat.courseCount / maxCourses) * 100);

                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {cat.name}
                      </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400 shrink-0 ml-2">
                        {cat.courseCount} khóa học
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-8 text-xs text-gray-400">Chưa có dữ liệu danh mục khóa học.</p>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
              <span>Tổng số bài học (Lessons):</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.totalLessons} bài</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Row 3: Lối tắt Quản trị Nhanh (Quick Actions) */}
      <Card>
        <CardBody className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Lối tắt thao tác nhanh
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Truy cập nhanh các chức năng quản trị thường dùng</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/users')}
                className="gap-1.5 text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Thêm tài khoản
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/categories')}
                className="gap-1.5 text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Thêm danh mục
              </Button>

              <a
                href="http://localhost:8080/swagger-ui.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-primary-500" />
                Swagger API Docs
              </a>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Row 4: 2 Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bảng 1: Người dùng mới đăng ký */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Người dùng mới đăng ký gần đây
              </h3>
              <Link to="/admin/users" className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Xem tất cả
              </Link>
            </div>
          </CardHeader>
          <CardBody className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
            {stats.recentUsers && stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'INSTRUCTOR' ? 'primary' : 'default'}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {user.status === 'ACTIVE' ? 'Hoạt động' : 'Khóa'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-gray-400">Chưa có người dùng mới.</p>
            )}
          </CardBody>
        </Card>

        {/* Bảng 2: Khóa học tạo gần đây */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                Khóa học mới nhất trong hệ thống
              </h3>
              <span className="text-xs text-gray-500">Cập nhật tự động</span>
            </div>
          </CardHeader>
          <CardBody className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
            {stats.recentCourses && stats.recentCourses.length > 0 ? (
              stats.recentCourses.map((course) => (
                <div key={course.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                      <span className="text-purple-600 dark:text-purple-400 font-medium truncate">
                        GV: {course.instructorName}
                      </span>
                      <span>•</span>
                      <span className="truncate">{course.categoryName}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Badge variant={course.status === 'PUBLISHED' ? 'success' : 'default'}>
                      {course.status === 'PUBLISHED' ? 'Xuất bản' : 'Bản nháp'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-gray-400">Chưa có khóa học nào được tạo.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
