import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  Award,
  PlayCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Video,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentDashboard } from '../../hooks/useStudentHooks';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useStudentDashboard();

  const todayFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Không thể tải thông tin học tập của bạn. Vui lòng kiểm tra lại kết nối.
        </p>
      </div>
    );
  }

  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return { label: 'Không có hạn', variant: 'default' as const };
    const deadline = new Date(dateStr);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return { label: 'Đã hết hạn', variant: 'danger' as const };
    }
    if (diffDays === 0) {
      return { label: 'Hết hạn hôm nay', variant: 'warning' as const };
    }
    if (diffDays === 1) {
      return { label: 'Còn 1 ngày', variant: 'warning' as const };
    }
    return { label: `Còn ${diffDays} ngày`, variant: 'primary' as const };
  };

  const getRankBadge = (score?: number | null) => {
    if (score == null) return null;
    if (score >= 8.5)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          Xuất sắc
        </span>
      );
    if (score >= 7.0)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
          Khá - Giỏi
        </span>
      );
    if (score >= 5.0)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          Đạt
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
        Cần cố gắng
      </span>
    );
  };

  const resume = stats.resumeLearning;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Không gian học tập cá nhân hóa
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Xin chào, {user?.name || 'Học viên'}!
            </h1>
            <p className="text-white/90 text-sm max-w-2xl leading-relaxed">
              Tiếp tục bài giảng hôm nay, hoàn thành bài tập đúng hạn và theo dõi lộ trình phát triển kỹ năng của bạn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white">
              <span className="opacity-80 block text-[10px] uppercase tracking-wider font-semibold">Thời gian</span>
              <span className="font-bold text-sm capitalize">{todayFormatted}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/student/classes')}
              className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-sm gap-2 font-semibold"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Lớp học của tôi</span>
            </Button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Lớp học đã ghi danh */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100 dark:border-gray-800">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Lớp học tham gia
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.totalEnrolledClasses}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                {stats.inProgressClasses} lớp đang diễn ra
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Tiến độ hoàn thành bài học */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100 dark:border-gray-800">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tiến độ học tập
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.overallProgressPercent}%
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.completedLessons} / {stats.totalLessons} bài hoàn thành
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Bài tập & Quiz */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100 dark:border-gray-800">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nhiệm vụ đã nộp
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.totalSubmissions + stats.totalQuizAttempts}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.totalSubmissions} bài nộp · {stats.totalQuizAttempts} lượt quiz
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Điểm số trung bình */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100 dark:border-gray-800">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <Award className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Điểm trung bình
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageScore != null ? stats.averageScore.toFixed(1) : '—'}
                </h3>
                {stats.averageScore != null && (
                  <span className="text-xs text-gray-400">/ 10</span>
                )}
              </div>
              <div className="mt-1">
                {stats.averageScore != null ? (
                  getRankBadge(stats.averageScore)
                ) : (
                  <span className="text-xs text-gray-400">Chưa có điểm</span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Resume Learning (1-Click Standout Action) */}
      {resume ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/80 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 dark:from-indigo-950/20 dark:via-gray-900 dark:to-purple-950/20 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white flex items-center gap-1">
                  <PlayCircle className="w-3.5 h-3.5" />
                  Tiếp tục học ngay
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Lớp: <strong className="text-gray-700 dark:text-gray-300">{resume.className}</strong>
                </span>
                <span>•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Khóa học: <strong className="text-gray-700 dark:text-gray-300">{resume.courseTitle}</strong>
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {resume.lessonType === 'VIDEO' ? (
                    <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  ) : (
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                  <span className="truncate">
                    Bài {resume.chapterOrderNo}.{resume.lessonOrderNo}: {resume.lessonTitle}
                  </span>
                </h3>
              </div>

              {/* Progress bar của lớp học */}
              <div className="max-w-md">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Tiến độ lớp học</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {resume.classProgressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${resume.classProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <Button
                size="lg"
                onClick={() => navigate(`/student/classes/${resume.classId}/learn/${resume.lessonId}`)}
                className="w-full sm:w-auto gap-2 shadow-md hover:shadow-lg font-bold"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Vào học ngay</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bạn chưa có lớp học nào đang diễn ra. Hãy liên hệ Giảng viên hoặc Phòng đào tạo để được ghi danh vào lớp.
          </p>
        </div>
      )}

      {/* 4. Two-Column Grid: Deadlines & Recent Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bài tập & Nhiệm vụ sắp đến hạn */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <CardHeader className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Bài tập & Nhiệm vụ cần nộp
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hạn chót các bài thực hành trong lớp học
                </p>
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-5 flex-1">
            {!stats.upcomingDeadlines || stats.upcomingDeadlines.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Không có bài tập nào đang chờ!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Bạn đã hoàn thành các nhiệm vụ hoặc chưa có bài tập mới được giao.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingDeadlines.map((task) => {
                  const deadlineInfo = formatDeadline(task.deadline);
                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 hover:border-amber-200 dark:hover:border-amber-800 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant={deadlineInfo.variant}>
                            {deadlineInfo.label}
                          </Badge>
                          {task.isSubmitted ? (
                            <Badge variant="success">
                              {task.status === 'GRADED' ? `Điểm: ${task.score}/${task.maxScore}` : 'Đã nộp bài'}
                            </Badge>
                          ) : (
                            <Badge variant="warning">Chưa nộp</Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {task.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {task.courseTitle} · Lớp: {task.className}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <Button
                          variant={task.isSubmitted ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() =>
                            navigate(`/student/classes/${task.classId}/learn/${task.lessonId}?tab=assignment`)
                          }
                          className="text-xs gap-1"
                        >
                          <span>{task.isSubmitted ? 'Xem lại' : 'Làm bài'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Kết quả học tập gần đây */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <CardHeader className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Kết quả học tập gần đây
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Điểm số các bài kiểm tra & nhận xét từ Giảng viên
                </p>
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-5 flex-1">
            {!stats.recentGrades || stats.recentGrades.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mb-2">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Chưa có kết quả điểm số nào
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Điểm trắc nghiệm và bài tập sau khi giảng viên chấm sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentGrades.map((grade) => (
                  <div
                    key={`${grade.type}-${grade.id}`}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                            {grade.type === 'QUIZ' ? 'Trắc nghiệm Quiz' : 'Bài tập thực hành'}
                          </span>
                          {getRankBadge(grade.score)}
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {grade.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {grade.courseTitle}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          <span className="text-primary-600 dark:text-primary-400">{grade.score}</span>
                          <span className="text-xs text-gray-400"> / {grade.maxScore}</span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {grade.submittedAt
                            ? new Date(grade.submittedAt).toLocaleDateString('vi-VN')
                            : ''}
                        </span>
                      </div>
                    </div>

                    {/* Nhận xét từ giảng viên nếu có */}
                    {grade.feedback && (
                      <div className="mt-2.5 pt-2.5 border-t border-gray-200/60 dark:border-gray-700/60 text-xs text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-800/80 p-2 rounded-xl">
                        <strong>Nhận xét:</strong> {grade.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* 5. Section: Lớp học đang tham gia (My Enrolled Classes) */}
      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Tiến độ các lớp học của bạn
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Theo dõi tiến trình bài học và truy cập không gian học tập từng lớp
              </p>
            </div>
          </div>
          <Link
            to="/student/classes"
            className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
          >
            Xem tất cả lớp <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>

        <CardBody className="p-5">
          {!stats.myClasses || stats.myClasses.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Bạn chưa được ghi danh vào lớp học nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.myClasses.map((cls) => (
                <div
                  key={cls.classId}
                  onClick={() => navigate(`/student/classes/${cls.classId}/progress`)}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge
                        variant={
                          cls.status === 'OPEN'
                            ? 'success'
                            : cls.status === 'IN_PROGRESS'
                            ? 'primary'
                            : 'default'
                        }
                      >
                        {cls.status === 'OPEN'
                          ? 'Đang mở'
                          : cls.status === 'IN_PROGRESS'
                          ? 'Đang học'
                          : 'Đã kết thúc'}
                      </Badge>
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                        {cls.progressPercent}%
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                      {cls.className}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {cls.courseTitle}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      Giảng viên: <span className="font-medium text-gray-700 dark:text-gray-300">{cls.instructorName}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      <span>Tiến trình hoàn thành</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {cls.completedLessons}/{cls.totalLessons} bài
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                        style={{ width: `${cls.progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-primary-600 dark:text-primary-400 font-medium">
                      <span>Vào học tiếp</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
