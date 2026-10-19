import { useStudentGradebook } from '../../hooks/useGradebookHooks';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { StudentGradeItem } from '../../types/gradebook';
import {
  Award,
  BookOpen,
  FileText,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';

interface StudentGradebookViewProps {
  classId: number;
}

export const StudentGradebookView = ({ classId }: StudentGradebookViewProps) => {
  const { data: gradebook, isLoading } = useStudentGradebook(classId);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!gradebook) {
    return (
      <div className="p-8 text-center text-gray-500">
        Không thể tải dữ liệu bảng điểm cá nhân.
      </div>
    );
  }

  const { items, overallAverageScore, progressPercentage, completedLessons, totalLessons } =
    gradebook;

  const completedItemsCount = items.filter(
    (i: StudentGradeItem) => i.status === 'COMPLETED' || i.status === 'GRADED'
  ).length;

  const getRankBadge = (score?: number | null) => {
    if (score == null) return null;
    if (score >= 8.5)
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          Xếp loại: Xuất sắc
        </span>
      );
    if (score >= 7.0)
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
          Xếp loại: Khá - Giỏi
        </span>
      );
    if (score >= 5.0)
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          Xếp loại: Đạt
        </span>
      );
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
        Xếp loại: Chưa đạt
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner Tổng kết điểm số & Tiến độ */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200/60 dark:border-purple-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Bảng điểm & Kết quả học tập
              </h3>
              {getRankBadge(overallAverageScore)}
            </div>
            <p className="text-xs text-gray-500 max-w-lg leading-relaxed">
              Tổng hợp điểm số của tất cả các bài kiểm tra trắc nghiệm (Quiz) và bài tập thực hành (Assignment) trong lớp học.
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-4 h-4 text-primary-500" />
                Tiến độ: {completedLessons}/{totalLessons} bài học ({progressPercentage}%)
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Award className="w-4 h-4 text-purple-500" />
                Đã hoàn thành: {completedItemsCount}/{items.length} đầu điểm
              </span>
            </div>
          </div>

          {/* Điểm tổng kết */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <div className="text-right">
              <div className="text-xs text-gray-500 font-medium">Điểm TB tích lũy</div>
              <div className="text-xs text-gray-400">Thang điểm 10</div>
            </div>

            <div
              className={`w-18 h-18 rounded-2xl flex flex-col items-center justify-center font-black shadow-md ${
                overallAverageScore != null && overallAverageScore >= 8
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 shadow-emerald-500/10'
                  : overallAverageScore != null && overallAverageScore >= 5
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 shadow-blue-500/10'
                  : overallAverageScore != null
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 shadow-amber-500/10'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <span className="text-2xl leading-none">
                {overallAverageScore != null ? overallAverageScore : '—'}
              </span>
              <span className="text-[10px] font-semibold opacity-75 mt-0.5">/ 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách các đầu điểm */}
      <div className="space-y-3.5">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs text-gray-500">
          Chi tiết từng bài kiểm tra & bài tập ({items.length})
        </h4>

        {items.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-850">
            <p className="text-sm text-gray-500">
              Khóa học này chưa có bài Quiz hoặc Assignment nào.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: StudentGradeItem) => (
              <div
                key={`${item.type}-${item.itemId}`}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xs transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      item.type === 'QUIZ'
                        ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                    }`}
                  >
                    {item.type === 'QUIZ' ? (
                      <HelpCircle className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.type === 'QUIZ'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                        }`}
                      >
                        {item.type === 'QUIZ' ? 'Trắc nghiệm (Quiz)' : 'Bài tập (Assignment)'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                      Bài học: {item.lessonTitle}
                    </p>

                    {item.comment && (
                      <div className="mt-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Nhận xét của Giảng viên:</strong> {item.comment}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score & Status */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    {item.status === 'COMPLETED' || item.status === 'GRADED' ? (
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Kết quả</div>
                        {item.correctCount != null && item.totalQuestions != null && (
                          <div className="text-[11px] text-gray-400">
                            Đúng {item.correctCount}/{item.totalQuestions} câu
                          </div>
                        )}
                      </div>
                    ) : item.status === 'SUBMITTED' ? (
                      <Badge variant="primary">Đã nộp • Chờ chấm</Badge>
                    ) : (
                      <Badge variant="default">Chưa làm bài</Badge>
                    )}
                  </div>

                  {item.score != null ? (
                    <div
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold ${
                        item.score >= 8
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : item.score >= 5
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      <span className="text-lg leading-none">{item.score}</span>
                      <span className="text-[9px] font-semibold opacity-75 mt-0.5">/ 10</span>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 font-semibold text-sm">
                      —
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
