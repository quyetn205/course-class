import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  FileCheck,
  Award,
  Layers,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useInstructorDashboard } from '../../hooks/useInstructorHooks';
import { useGradeSubmission } from '../../hooks/useAssignmentHooks';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../api/axiosClient';
import type { PendingSubmissionDto } from '../../types/instructor';
import toast from 'react-hot-toast';

export const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: stats, isLoading, error } = useInstructorDashboard();
  const gradeMutation = useGradeSubmission();

  // Quick grading modal state
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmissionDto | null>(null);
  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const openGradeModal = (sub: PendingSubmissionDto) => {
    setSelectedSubmission(sub);
    setScore(sub.score !== undefined && sub.score !== null ? String(sub.score) : '');
    setFeedback('');
  };

  const closeGradeModal = () => {
    setSelectedSubmission(null);
    setScore('');
    setFeedback('');
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const numScore = parseFloat(score);
    const maxScore = selectedSubmission.maxScore ?? 10;
    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
      toast.error(`Điểm số phải là số hợp lệ từ 0 đến ${maxScore}`);
      return;
    }

    gradeMutation.mutate(
      {
        submissionId: selectedSubmission.submissionId,
        data: {
          score: numScore,
          comment: feedback.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['instructor-dashboard'] });
          closeGradeModal();
        },
      }
    );
  };

  const getFileUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url}`;
  };

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
          Không thể tải dữ liệu thống kê giảng dạy. Vui lòng kiểm tra lại kết nối.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Khu vực Giảng viên chuyên nghiệp
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Xin chào, Thầy/Cô {user?.name || 'Giảng viên'}!
            </h1>
            <p className="text-white/90 text-sm max-w-2xl leading-relaxed">
              Theo dõi tình hình học tập của sinh viên, chấm điểm bài tập nhanh chóng và tổ chức các lớp học hiệu quả trong học kỳ này.
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
              onClick={() => navigate('/instructor/courses')}
              className="bg-white text-emerald-900 hover:bg-emerald-50 shadow-sm gap-2 font-semibold"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Khóa học</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/instructor/classes')}
              className="bg-emerald-800/60 hover:bg-emerald-800 text-white border border-white/20 shadow-sm gap-2 font-semibold"
            >
              <GraduationCap className="w-4 h-4 text-emerald-200" />
              <span>Lớp học</span>
            </Button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-teal-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Khóa học */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100 dark:border-gray-800">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tổng Khóa học
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.totalCourses}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {stats.publishedCourses} công khai
                </span>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {stats.draftCourses} bản nháp
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lớp học */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100 dark:border-gray-800">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Lớp học phụ trách
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.totalClassrooms}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  {stats.openClassrooms} mở đăng ký
                </span>
                <span>•</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {stats.inProgressClassrooms} đang dạy
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tổng sinh viên */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100 dark:border-gray-800">
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
              <Users className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tổng Học viên
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.totalStudents}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Học viên đang ghi danh
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Bài tập cần chấm */}
        <Card className={`hover:shadow-md transition-shadow duration-200 ${
          stats.pendingSubmissions > 0
            ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/10'
            : 'border-gray-100 dark:border-gray-800'
        }`}>
          <CardBody className="p-5 flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${
              stats.pendingSubmissions > 0
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            }`}>
              {stats.pendingSubmissions > 0 ? (
                <AlertCircle className="w-7 h-7" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bài tập cần chấm
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-2xl font-bold ${
                  stats.pendingSubmissions > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {stats.pendingSubmissions}
                </h3>
                {stats.pendingSubmissions > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200 font-semibold animate-pulse">
                    Cần chấm
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Đã chấm: <strong className="text-emerald-600">{stats.gradedSubmissions}</strong> / {stats.totalSubmissions} bài
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Section: Bài tập chờ chấm điểm (High Priority Action) */}
      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Bài nộp bài tập mới nhất</span>
                {stats.pendingSubmissions > 0 && (
                  <Badge variant="warning">
                    {stats.pendingSubmissions} bài chưa chấm
                  </Badge>
                )}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chấm điểm trực tiếp 1-click hoặc tải bài làm của sinh viên để đánh giá
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {!stats.recentSubmissions || stats.recentSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                Chưa có bài nộp nào đang chờ!
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1">
                Tất cả bài tập đã được chấm hoặc học viên chưa nộp bài mới. Hệ thống sẽ tự động cập nhật khi có bài nộp.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3.5">Học viên</th>
                    <th className="px-6 py-3.5">Bài tập / Bài học</th>
                    <th className="px-6 py-3.5">Khóa học</th>
                    <th className="px-6 py-3.5">Thời gian nộp</th>
                    <th className="px-6 py-3.5">Trạng thái & Điểm</th>
                    <th className="px-6 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats.recentSubmissions.map((sub) => {
                    const isPending = sub.status === 'SUBMITTED' || sub.status === 'LATE';
                    return (
                      <tr
                        key={sub.submissionId}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        {/* Học viên */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center shrink-0">
                              {(sub.studentName || 'H').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {sub.studentName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {sub.studentEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Bài tập */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {sub.assignmentTitle}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            Bài học: {sub.lessonTitle}
                          </p>
                        </td>

                        {/* Khóa học */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            {sub.courseTitle}
                          </span>
                        </td>

                        {/* Thời gian */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              {sub.submittedAt
                                ? new Date(sub.submittedAt).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '—'}
                            </span>
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isPending ? (
                            <Badge variant="warning">
                              Chờ chấm điểm
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="success">
                                Đã chấm: {sub.score} / {sub.maxScore ?? 10}
                              </Badge>
                            </div>
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {sub.fileUrl && (
                              <a
                                href={getFileUrl(sub.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Xem file bài nộp"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Xem file</span>
                              </a>
                            )}
                            <Button
                              variant={isPending ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => openGradeModal(sub)}
                              className="gap-1.5 text-xs"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>{isPending ? 'Chấm điểm' : 'Sửa điểm'}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 4. Two-Column Grid: Lớp học & Khóa học */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lớp học đang phụ trách */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <CardHeader className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Lớp học đang phụ trách
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tiến độ và sĩ số sinh viên từng lớp
                </p>
              </div>
            </div>
            <Link
              to="/instructor/classes"
              className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>

          <CardBody className="p-5 flex-1">
            {!stats.myClasses || stats.myClasses.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Bạn chưa phụ trách lớp học nào.
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/instructor/classes')}
                  >
                    Mở lớp học ngay
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.myClasses.map((cls) => {
                  const max = cls.maxStudents || 50;
                  const current = cls.currentStudents || 0;
                  const percent = Math.min(100, Math.round((current / max) * 100));

                  return (
                    <div
                      key={cls.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {cls.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                            Khóa học: {cls.courseTitle}
                          </p>
                        </div>
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
                            : 'Đã đóng'}
                        </Badge>
                      </div>

                      {/* Sĩ số progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Sĩ số học viên</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {current} / {max} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Thời gian */}
                      <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {cls.startDate || 'Chưa định ngày'}
                            {cls.endDate ? ` → ${cls.endDate}` : ''}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate('/instructor/classes')}
                          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                        >
                          Chi tiết <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Khóa học gần đây */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <CardHeader className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Khóa học gần đây
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Chương trình đào tạo và nội dung bài giảng
                </p>
              </div>
            </div>
            <Link
              to="/instructor/courses"
              className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>

          <CardBody className="p-5 flex-1">
            {!stats.myCourses || stats.myCourses.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Bạn chưa tạo khóa học nào.
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/instructor/courses')}
                  >
                    Soạn khóa học đầu tiên
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.myCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-3 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden shadow-sm">
                        {c.thumbnailUrl ? (
                          <img
                            src={getFileUrl(c.thumbnailUrl)}
                            alt={c.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          c.title.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {c.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {c.categoryName && (
                            <span className="px-2 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                              {c.categoryName}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {c.chapterCount} chương
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant={c.status === 'PUBLISHED' ? 'success' : 'warning'}
                      >
                        {c.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/instructor/courses')}
                        className="text-xs"
                      >
                        Sửa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* 5. Quick Grade Modal */}
      <Modal
        isOpen={!!selectedSubmission}
        onClose={closeGradeModal}
        title="Chấm điểm bài nộp"
        size="md"
      >
        {selectedSubmission && (
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Học viên:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedSubmission.studentName} ({selectedSubmission.studentEmail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Bài tập:</span>
                <span className="font-medium text-gray-900 dark:text-white text-right">
                  {selectedSubmission.assignmentTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Khóa học:</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {selectedSubmission.courseTitle}
                </span>
              </div>
              {selectedSubmission.fileUrl && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tệp bài làm:</span>
                  <a
                    href={getFileUrl(selectedSubmission.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-3 py-1 rounded-lg"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở / Tải bài làm</span>
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Điểm số (Thang điểm: {selectedSubmission.maxScore ?? 10}) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max={selectedSubmission.maxScore ?? 10}
                placeholder={`Nhập điểm (0 - ${selectedSubmission.maxScore ?? 10})`}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nhận xét & Góp ý cho sinh viên
              </label>
              <Textarea
                rows={3}
                placeholder="Nhận xét ưu điểm, điểm cần cải thiện..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button
                type="button"
                variant="ghost"
                onClick={closeGradeModal}
                disabled={gradeMutation.isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={gradeMutation.isPending}
                className="gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Lưu kết quả chấm</span>
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
