import { useState, useEffect } from 'react';
import { useLessonAssignment, useCreateAssignment, useDeleteAssignment, useSubmissions, useGradeSubmission } from '../../hooks/useAssignmentHooks';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ClipboardList, Plus, Trash2, Calendar, Award, FileText, CheckCircle, Download, Clock } from 'lucide-react';
import type { SubmissionResponse } from '../../types/assignment';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api/axiosClient';

interface AssignmentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  lessonTitle: string;
}

export const AssignmentManagerModal = ({ isOpen, onClose, lessonId, lessonTitle }: AssignmentManagerModalProps) => {
  const { data: assignment, isLoading, refetch } = useLessonAssignment(lessonId);
  const createMutation = useCreateAssignment();
  const deleteMutation = useDeleteAssignment();
  const gradeMutation = useGradeSubmission();

  const { data: submissionsData, isLoading: loadingSubmissions, refetch: refetchSubmissions } = useSubmissions(
    assignment?.id ?? 0,
    { page: 0, size: 50 }
  );

  // Form create assignment
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxScore, setMaxScore] = useState('10');

  // Grading state
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionResponse | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeComment, setGradeComment] = useState('');

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (lessonTitle) {
      setTitle(`Bài tập thực hành: ${lessonTitle}`);
    }
    // Default deadline 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDeadline(d.toISOString().slice(0, 16));
    setMaxScore('10');
    setGradingSubmission(null);
  }, [lessonId, lessonTitle, isOpen]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài tập');
      return;
    }

    createMutation.mutate(
      {
        lessonId,
        data: {
          title: title.trim(),
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
          maxScore: maxScore ? Number(maxScore) : 10,
        },
      },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!assignment) return;
    deleteMutation.mutate(assignment.id, {
      onSuccess: () => {
        setConfirmDelete(false);
        refetch();
      },
    });
  };

  const handleOpenGrade = (sub: SubmissionResponse) => {
    setGradingSubmission(sub);
    setGradeScore(sub.score != null ? String(sub.score) : '10');
    setGradeComment(sub.comment || '');
  };

  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    const scoreNum = Number(gradeScore);
    const max = assignment?.maxScore ?? 10;
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > max) {
      toast.error(`Điểm số phải từ 0 đến ${max}`);
      return;
    }

    gradeMutation.mutate(
      {
        submissionId: gradingSubmission.id,
        data: {
          score: scoreNum,
          comment: gradeComment.trim(),
        },
      },
      {
        onSuccess: () => {
          setGradingSubmission(null);
          refetchSubmissions();
        },
      }
    );
  };

  const submissions = submissionsData?.content ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quản lý Bài tập nộp file — ${lessonTitle}`}
      size="xl"
    >
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : !assignment ? (
        /* Giao diện tạo bài tập mới */
        <form onSubmit={handleCreate} className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Bài học này chưa có bài tập nộp file
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                Tạo bài tập để học sinh có thể tải lên file bài làm (PDF, Word, ZIP, ảnh...), sau đó bạn có thể xem và chấm điểm trực tiếp.
              </p>
            </div>
          </div>

          <Input
            label="Tiêu đề bài tập"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Bài tập thực hành chương 1"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hạn chót nộp bài (Deadline)"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <Input
              label="Thang điểm tối đa"
              type="number"
              min="1"
              max="100"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              <Plus className="w-4 h-4 mr-1.5" /> Tạo bài tập cho bài học
            </Button>
          </div>
        </form>
      ) : (
        /* Giao diện đã có Assignment */
        <div className="space-y-6">
          {/* Header Assignment info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {assignment.title}
                </h3>
                <Badge variant="success">Bài tập nộp file</Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
                {assignment.deadline ? (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Hạn nộp: {new Date(assignment.deadline).toLocaleString('vi-VN')}
                  </span>
                ) : (
                  <span className="text-gray-400">Không giới hạn thời gian</span>
                )}
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Điểm tối đa: {assignment.maxScore ?? 10} điểm
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Đã có {submissions.length} bài nộp
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmDelete(true)}
              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa bài tập
            </Button>
          </div>

          {/* Form Chấm điểm bài nộp (nếu đang chọn 1 bài) */}
          {gradingSubmission && (
            <form onSubmit={handleSubmitGrade} className="p-4 rounded-xl border-2 border-primary-500/30 bg-primary-50/20 dark:bg-primary-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Chấm điểm cho: <span className="text-primary-600">{gradingSubmission.studentName}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Đóng chấm điểm
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <Input
                    label={`Điểm (max ${assignment.maxScore ?? 10})`}
                    type="number"
                    step="0.1"
                    min="0"
                    max={assignment.maxScore ?? 10}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <Input
                    label="Nhận xét / Góp ý cho học sinh"
                    value={gradeComment}
                    onChange={(e) => setGradeComment(e.target.value)}
                    placeholder="Ví dụ: Bài làm tốt, logic code rõ ràng..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" size="sm" variant="outline" onClick={() => setGradingSubmission(null)}>
                  Hủy
                </Button>
                <Button type="submit" size="sm" isLoading={gradeMutation.isPending}>
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Lưu điểm số
                </Button>
              </div>
            </form>
          )}

          {/* Danh sách bài nộp của học sinh */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Danh sách bài nộp ({submissions.length})
              </h4>
            </div>

            {loadingSubmissions ? (
              <div className="py-6 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
                <ClipboardList className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Chưa có học sinh nào nộp bài tập này
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Khi học sinh nộp bài, danh sách bài nộp và file đính kèm sẽ hiển thị tại đây để bạn chấm điểm.
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                {submissions.map((sub) => {
                  const isGraded = sub.status === 'GRADED';
                  return (
                    <div key={sub.id} className="p-3.5 sm:p-4 bg-white dark:bg-gray-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            {sub.studentName}
                          </span>
                          <Badge variant={isGraded ? 'success' : 'warning'}>
                            {isGraded ? 'Đã chấm điểm' : 'Chưa chấm'}
                          </Badge>
                          {sub.isLate && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                              Nộp muộn
                            </span>
                          )}
                          {isGraded && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                              {sub.score}/{assignment.maxScore ?? 10} điểm
                            </span>
                          )}
                        </div>

                        {sub.submittedAt && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            Nộp lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                          </div>
                        )}

                        {/* File link */}
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          {sub.file ? (
                            <a
                              href={sub.file.startsWith('http') ? sub.file : `${API_BASE_URL}${sub.file}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary-600 hover:underline font-medium"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Xem/Tải bài làm học sinh
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Không có file đính kèm</span>
                          )}
                        </div>

                        {sub.comment && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                            Lời phê: "{sub.comment}"
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={isGraded ? 'outline' : 'primary'}
                          onClick={() => handleOpenGrade(sub)}
                        >
                          {isGraded ? 'Sửa điểm' : 'Chấm điểm'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Xác nhận xóa bài tập */}
      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Xóa bài tập này?"
        message="Hành động này sẽ xóa toàn bộ bài tập và các bài nộp của học sinh liên quan. Bạn có chắc chắn không?"
        confirmText="Xác nhận xóa"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </Modal>
  );
};
