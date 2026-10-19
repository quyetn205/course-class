import { useAttemptDetail } from '../../hooks/useQuizHooks';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { CheckCircle, XCircle, Check, X, Award, Clock, Mail } from 'lucide-react';

interface StudentAttemptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptId: number | null;
}

export const StudentAttemptDetailModal = ({
  isOpen,
  onClose,
  attemptId,
}: StudentAttemptDetailModalProps) => {
  const { data: attempt, isLoading } = useAttemptDetail(attemptId ?? 0);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết kết quả làm bài của học viên"
      size="lg"
    >
      {isLoading || !attempt ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header Thông tin học viên & Điểm số */}
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center">
                  {attempt.studentName?.charAt(0)?.toUpperCase() || 'H'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                    {attempt.studentName}
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    {attempt.studentEmail || 'Chưa có email'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Nộp lúc: {new Date(attempt.submittedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Score pill */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              <div className="text-right">
                <div className="text-xs text-gray-500">Kết quả</div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-primary-500" />
                  {attempt.correctCount ?? 0}/{attempt.totalQuestions ?? 0} câu đúng
                </div>
              </div>

              <div
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${
                  attempt.score >= 8
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : attempt.score >= 5
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                <span className="text-xl leading-none">{attempt.score}</span>
                <span className="text-[9px] font-semibold opacity-75 mt-0.5">/ 10</span>
              </div>
            </div>
          </div>

          {/* Danh sách từng câu hỏi */}
          <div className="space-y-3.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Chi tiết câu trả lời ({attempt.answers?.length ?? 0} câu hỏi)
            </h5>

            {attempt.answers?.map((ans, idx) => (
              <div
                key={ans.id || ans.questionId}
                className={`p-4 rounded-xl border bg-white dark:bg-gray-800 space-y-3 transition-all ${
                  ans.isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/40'
                    : 'border-red-200 dark:border-red-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        ans.isCorrect
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">
                      {ans.questionContent}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {ans.isCorrect ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="w-3 h-3" /> Đúng
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="gap-1">
                        <XCircle className="w-3 h-3" /> Sai
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Các lựa chọn đáp án */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 pt-1">
                  {ans.options?.map((opt, optIdx) => {
                    const isStudentChoice = ans.selectedOptionId === opt.id;
                    const isTheCorrectOption = opt.isCorrect || ans.correctOptionId === opt.id;
                    const label = String.fromCharCode(65 + optIdx);

                    let styleClasses =
                      'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-850 text-gray-600 dark:text-gray-400';
                    let badgeElement = null;

                    if (isStudentChoice && isTheCorrectOption) {
                      styleClasses =
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-medium';
                      badgeElement = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                          <Check className="w-2.5 h-2.5" /> Học viên chọn (Đúng)
                        </span>
                      );
                    } else if (isStudentChoice && !isTheCorrectOption) {
                      styleClasses =
                        'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-2 ring-red-500/20 font-medium';
                      badgeElement = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/60 px-1.5 py-0.5 rounded">
                          <X className="w-2.5 h-2.5" /> Học viên chọn (Sai)
                        </span>
                      );
                    } else if (isTheCorrectOption) {
                      styleClasses =
                        'border-emerald-400 border-dashed bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-medium';
                      badgeElement = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                          <Check className="w-2.5 h-2.5" /> Đáp án đúng
                        </span>
                      );
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg text-xs border transition-all ${styleClasses}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isStudentChoice && isTheCorrectOption
                                ? 'bg-emerald-600 text-white'
                                : isStudentChoice && !isTheCorrectOption
                                ? 'bg-red-600 text-white'
                                : isTheCorrectOption
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {label}
                          </span>
                          <span className="truncate">{opt.content}</span>
                        </div>
                        {badgeElement && <div className="shrink-0 ml-2">{badgeElement}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
