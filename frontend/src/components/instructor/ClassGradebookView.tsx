import { useState } from 'react';
import { useClassGradebook } from '../../hooks/useGradebookHooks';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { StudentGradeRow, GradebookItemColumn } from '../../types/gradebook';
import {
  Award,
  CheckCircle2,
  Download,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';

interface ClassGradebookViewProps {
  classId: number;
}

export const ClassGradebookView = ({ classId }: ClassGradebookViewProps) => {
  const { data: gradebook, isLoading } = useClassGradebook(classId);
  const [searchTerm, setSearchTerm] = useState('');

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
        Không thể tải dữ liệu bảng điểm lớp học.
      </div>
    );
  }

  const { studentRows, quizzes, assignments } = gradebook;
  const totalStudents = studentRows.length;

  // Filtered rows
  const filteredRows = studentRows.filter(
    (s: StudentGradeRow) =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      s.studentEmail.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Statistics
  const studentsWithScore = studentRows.filter((s: StudentGradeRow) => s.averageScore != null);
  const classAvgScore =
    studentsWithScore.length > 0
      ? (
          studentsWithScore.reduce((sum: number, s: StudentGradeRow) => sum + s.averageScore!, 0) /
          studentsWithScore.length
        ).toFixed(1)
      : '—';

  const classAvgProgress =
    totalStudents > 0
      ? Math.round(
          studentRows.reduce((sum: number, s: StudentGradeRow) => sum + s.progressPercentage, 0) /
            totalStudents
        )
      : 0;

  const completedCount = studentRows.filter((s: StudentGradeRow) => s.progressPercentage === 100).length;

  const getRankBadge = (score?: number | null) => {
    if (score == null) return <span className="text-gray-400 text-xs">—</span>;
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
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
        Chưa đạt
      </span>
    );
  };

  const exportToCsv = () => {
    const headers = [
      'STT',
      'Họ và tên',
      'Email',
      'Tiến độ (%)',
      ...quizzes.map((q: GradebookItemColumn) => `Quiz: ${q.title}`),
      ...assignments.map((a: GradebookItemColumn) => `Bài tập: ${a.title}`),
      'Điểm trung bình (GPA)',
      'Xếp loại',
    ];

    const rows = studentRows.map((s: StudentGradeRow, idx: number) => {
      const qScores = quizzes.map((q: GradebookItemColumn) =>
        s.quizScores[q.id]?.score != null ? s.quizScores[q.id].score : '-'
      );
      const aScores = assignments.map((a: GradebookItemColumn) => {
        const item = s.assignmentScores[a.id];
        if (!item) return '-';
        if (item.score != null) return item.score;
        if (item.status === 'SUBMITTED') return 'Chờ chấm';
        return '-';
      });

      const rank =
        s.averageScore != null
          ? s.averageScore >= 8.5
            ? 'Xuất sắc'
            : s.averageScore >= 7
            ? 'Khá - Giỏi'
            : s.averageScore >= 5
            ? 'Đạt'
            : 'Chưa đạt'
          : 'Chưa có điểm';

      return [
        idx + 1,
        `"${s.studentName}"`,
        s.studentEmail,
        `${s.progressPercentage}%`,
        ...qScores,
        ...aScores,
        s.averageScore != null ? s.averageScore : '-',
        `"${rank}"`,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r: (string | number | null | undefined)[]) => r.map((c) => c ?? '').join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bang_diem_${gradebook.className.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 4 Thống kê tổng quan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-purple-100 dark:border-purple-900/30">
          <CardBody className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Tổng học viên</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {totalStudents} bạn
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-100 dark:border-blue-900/30">
          <CardBody className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Tiến độ TB lớp</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {classAvgProgress}%
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-emerald-100 dark:border-emerald-900/30">
          <CardBody className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Điểm trung bình lớp</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {classAvgScore} <span className="text-xs font-normal opacity-70">/ 10</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-amber-100 dark:border-amber-900/30">
          <CardBody className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Hoàn thành 100%</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {completedCount} / {totalStudents}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc email học viên..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={exportToCsv}
            disabled={totalStudents === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Xuất file CSV (Excel)
          </Button>
        </div>
      </div>

      {/* Bảng ma trận điểm số */}
      {totalStudents === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
          <Users className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Lớp học chưa có học viên nào
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Hãy thêm học viên vào lớp để bắt đầu theo dõi tiến độ và bảng điểm.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-xs">
          <div className="overflow-x-auto max-h-[650px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700">
                <tr className="text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3 w-10 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[200px]">Học viên</th>
                  <th className="py-3 px-3 text-center min-w-[110px]">Tiến độ</th>

                  {/* Quizzes */}
                  {quizzes.map((q: GradebookItemColumn) => (
                    <th
                      key={`quiz-${q.id}`}
                      className="py-3 px-3 text-center min-w-[120px] bg-purple-50/50 dark:bg-purple-950/20 border-l border-gray-200 dark:border-gray-700/60"
                      title={`${q.title} (${q.lessonTitle})`}
                    >
                      <div className="truncate max-w-[130px] font-bold text-purple-700 dark:text-purple-300">
                        {q.title}
                      </div>
                      <div className="text-[10px] font-normal text-gray-400 truncate max-w-[130px]">
                        Trắc nghiệm
                      </div>
                    </th>
                  ))}

                  {/* Assignments */}
                  {assignments.map((a: GradebookItemColumn) => (
                    <th
                      key={`assign-${a.id}`}
                      className="py-3 px-3 text-center min-w-[120px] bg-blue-50/50 dark:bg-blue-950/20 border-l border-gray-200 dark:border-gray-700/60"
                      title={`${a.title} (${a.lessonTitle})`}
                    >
                      <div className="truncate max-w-[130px] font-bold text-blue-700 dark:text-blue-300">
                        {a.title}
                      </div>
                      <div className="text-[10px] font-normal text-gray-400 truncate max-w-[130px]">
                        Bài nộp file
                      </div>
                    </th>
                  ))}

                  <th className="py-3 px-3 text-center min-w-[110px] bg-emerald-50/70 dark:bg-emerald-950/30 border-l border-gray-200 dark:border-gray-700 font-bold text-emerald-800 dark:text-emerald-200">
                    Điểm TB (GPA)
                  </th>
                  <th className="py-3 px-3 text-center min-w-[100px] border-l border-gray-200 dark:border-gray-700">
                    Xếp loại
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
                {filteredRows.map((s: StudentGradeRow, idx: number) => (
                  <tr
                    key={s.studentId}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-755/30 transition-colors"
                  >
                    <td className="py-3 px-3 text-center text-gray-400">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {s.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {s.studentName}
                          </div>
                          <div className="text-[11px] text-gray-400 font-normal truncate">
                            {s.studentEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                          {s.progressPercentage}%
                        </span>
                        <div className="w-14 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.progressPercentage === 100
                                ? 'bg-emerald-500'
                                : 'bg-primary-500'
                            }`}
                            style={{ width: `${s.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {s.completedLessons}/{gradebook.totalLessons} bài
                        </span>
                      </div>
                    </td>

                    {/* Quizzes scores */}
                    {quizzes.map((q: GradebookItemColumn) => {
                      const item = s.quizScores[q.id];
                      return (
                        <td
                          key={`score-quiz-${q.id}`}
                          className="py-3 px-3 text-center border-l border-gray-100 dark:border-gray-700/60"
                        >
                          {item && item.score != null ? (
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-md font-bold text-xs ${
                                item.score >= 8
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : item.score >= 5
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                              title={`Đúng: ${item.correctCount ?? 0}/${item.totalQuestions ?? 0} câu`}
                            >
                              {item.score}
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Assignments scores */}
                    {assignments.map((a: GradebookItemColumn) => {
                      const item = s.assignmentScores[a.id];
                      return (
                        <td
                          key={`score-assign-${a.id}`}
                          className="py-3 px-3 text-center border-l border-gray-100 dark:border-gray-700/60"
                        >
                          {item ? (
                            item.score != null ? (
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-md font-bold text-xs ${
                                  item.score >= 8
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : item.score >= 5
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                }`}
                                title={item.comment ? `Nhận xét: ${item.comment}` : undefined}
                              >
                                {item.score}
                              </span>
                            ) : item.status === 'SUBMITTED' ? (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                                Chờ chấm
                              </span>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-600">—</span>
                            )
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Average Score */}
                    <td className="py-3 px-3 text-center border-l border-gray-200 dark:border-gray-700 bg-emerald-50/20 dark:bg-emerald-950/10">
                      {s.averageScore != null ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md font-black text-xs ${
                            s.averageScore >= 8
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                              : s.averageScore >= 5
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                          }`}
                        >
                          {s.averageScore}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 font-normal">—</span>
                      )}
                    </td>

                    {/* Rank */}
                    <td className="py-3 px-3 text-center border-l border-gray-100 dark:border-gray-700/60">
                      {getRankBadge(s.averageScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
