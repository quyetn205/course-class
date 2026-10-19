import { useState, useEffect } from 'react';
import {
  useLessonQuiz,
  useCreateQuiz,
  useAddQuestion,
  useDeleteQuiz,
  useDeleteQuestion,
  useQuizAttempts,
} from '../../hooks/useQuizHooks';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { StudentAttemptDetailModal } from './StudentAttemptDetailModal';
import {
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Check,
  Eye,
  Users,
  Award,
  Clock,
  ListChecks,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface QuizManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  lessonTitle: string;
}

export const QuizManagerModal = ({ isOpen, onClose, lessonId, lessonTitle }: QuizManagerModalProps) => {
  const { data: quiz, isLoading, refetch } = useLessonQuiz(lessonId);
  const { data: attempts, isLoading: loadingAttempts } = useQuizAttempts(quiz?.id ?? 0);

  const createQuizMutation = useCreateQuiz();
  const addQuestionMutation = useAddQuestion();
  const deleteQuizMutation = useDeleteQuiz();
  const deleteQuestionMutation = useDeleteQuestion();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'QUESTIONS' | 'ATTEMPTS'>('QUESTIONS');
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);

  // Create quiz state
  const [quizTitle, setQuizTitle] = useState('');

  // Add question state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionContent, setQuestionContent] = useState('');
  const [options, setOptions] = useState([
    { label: 'A', content: '', isCorrect: true },
    { label: 'B', content: '', isCorrect: false },
    { label: 'C', content: '', isCorrect: false },
    { label: 'D', content: '', isCorrect: false },
  ]);

  // Dialog delete confirm
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);

  useEffect(() => {
    if (lessonTitle) {
      setQuizTitle(`Bài kiểm tra trắc nghiệm: ${lessonTitle}`);
    }
    setIsAddingQuestion(false);
    resetQuestionForm();
    setActiveTab('QUESTIONS');
  }, [lessonId, lessonTitle, isOpen]);

  const resetQuestionForm = () => {
    setQuestionContent('');
    setOptions([
      { label: 'A', content: '', isCorrect: true },
      { label: 'B', content: '', isCorrect: false },
      { label: 'C', content: '', isCorrect: false },
      { label: 'D', content: '', isCorrect: false },
    ]);
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề Quiz');
      return;
    }
    createQuizMutation.mutate(
      { lessonId, data: { title: quizTitle.trim() } },
      {
        onSuccess: () => {
          refetch();
          setIsAddingQuestion(true);
        },
      }
    );
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    if (!questionContent.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    const filledOptions = options.filter((o) => o.content.trim() !== '');
    if (filledOptions.length < 2) {
      toast.error('Vui lòng nhập ít nhất 2 đáp án lựa chọn');
      return;
    }

    const hasCorrect = filledOptions.some((o) => o.isCorrect);
    if (!hasCorrect) {
      toast.error('Vui lòng chọn 1 đáp án chính xác');
      return;
    }

    addQuestionMutation.mutate(
      {
        quizId: quiz.id,
        data: {
          content: questionContent.trim(),
          options: filledOptions.map((o) => ({
            content: o.content.trim(),
            isCorrect: o.isCorrect,
          })),
        },
      },
      {
        onSuccess: () => {
          refetch();
          resetQuestionForm();
          setIsAddingQuestion(false);
        },
      }
    );
  };

  const handleDeleteQuiz = () => {
    if (!quiz) return;
    deleteQuizMutation.mutate(quiz.id, {
      onSuccess: () => {
        setConfirmDeleteQuiz(false);
        refetch();
      },
    });
  };

  const handleDeleteQuestion = () => {
    if (!deletingQuestionId || !quiz) return;
    deleteQuestionMutation.mutate(
      { questionId: deletingQuestionId, quizId: quiz.id, lessonId },
      {
        onSuccess: () => {
          setDeletingQuestionId(null);
          refetch();
        },
      }
    );
  };

  // Stats calculation
  const totalAttempts = attempts?.length || 0;
  const avgScore =
    totalAttempts > 0
      ? (attempts!.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts).toFixed(1)
      : '0';
  const passedCount = attempts?.filter((a) => (a.score || 0) >= 5).length || 0;
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
  const highestScore = totalAttempts > 0 ? Math.max(...attempts!.map((a) => a.score || 0)) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quản lý Quiz (Trắc nghiệm) — ${lessonTitle}`}
      size="xl"
    >
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : !quiz ? (
        /* Giao diện tạo Quiz lần đầu */
        <form onSubmit={handleCreateQuiz} className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                Bài học này chưa có câu hỏi trắc nghiệm
              </h4>
              <p className="text-xs text-purple-700 dark:text-purple-300/80 mt-0.5 leading-relaxed">
                Tạo bài Quiz giúp học viên tự kiểm tra và củng cố kiến thức ngay sau khi xem video hoặc tài liệu.
              </p>
            </div>
          </div>

          <Input
            label="Tiêu đề bài kiểm tra trắc nghiệm"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Ví dụ: Kiểm tra nhanh bài 1"
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button type="submit" isLoading={createQuizMutation.isPending}>
              <Plus className="w-4 h-4 mr-1.5" /> Tạo Quiz cho bài học
            </Button>
          </div>
        </form>
      ) : (
        /* Giao diện đã có Quiz */
        <div className="space-y-5">
          {/* Header Quiz Title & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {quiz.title}
                </h3>
                <Badge variant="primary">
                  {quiz.questions?.length ?? 0} câu hỏi
                </Badge>
                {totalAttempts > 0 && (
                  <Badge variant="success">
                    {totalAttempts} lượt nộp
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tự động chấm điểm theo thang điểm 10 khi học sinh nộp bài.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmDeleteQuiz(true)}
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa Quiz
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('QUESTIONS')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'QUESTIONS'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              Nội dung câu hỏi ({quiz.questions?.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ATTEMPTS')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'ATTEMPTS'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Kết quả làm bài ({totalAttempts})
            </button>
          </div>

          {/* TAB 1: NỘI DUNG CÂU HỎI */}
          {activeTab === 'QUESTIONS' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Danh sách câu hỏi ({quiz.questions?.length ?? 0})
                </h4>
                {!isAddingQuestion && (
                  <Button size="sm" onClick={() => setIsAddingQuestion(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Thêm câu hỏi
                  </Button>
                )}
              </div>

              {/* Form thêm câu hỏi mới */}
              {isAddingQuestion && (
                <form onSubmit={handleSaveQuestion} className="p-5 rounded-xl border-2 border-primary-500/30 bg-primary-50/20 dark:bg-primary-950/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                        {(quiz.questions?.length ?? 0) + 1}
                      </span>
                      Thêm câu hỏi trắc nghiệm mới
                    </h4>
                    <button
                      type="button"
                      onClick={() => { setIsAddingQuestion(false); resetQuestionForm(); }}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  <Input
                    label="Nội dung câu hỏi"
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                    placeholder="Nhập câu hỏi, ví dụ: Ngôn ngữ Java do hãng nào phát triển ban đầu?"
                    required
                  />

                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Các lựa chọn đáp án (Chọn nút tròn để chỉ định đáp án đúng):
                    </label>
                    <div className="space-y-2">
                      {options.map((opt, idx) => (
                        <div
                          key={opt.label}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                            opt.isCorrect
                              ? 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOptions(options.map((o, i) => ({ ...o, isCorrect: i === idx })));
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              opt.isCorrect
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                            }`}
                            title="Chọn làm đáp án đúng"
                          >
                            {opt.isCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : opt.label}
                          </button>

                          <input
                            type="text"
                            value={opt.content}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOptions(options.map((o, i) => i === idx ? { ...o, content: val } : o));
                            }}
                            placeholder={`Nhập đáp án ${opt.label}...`}
                            className="flex-1 text-sm bg-transparent border-0 focus:outline-hidden focus:ring-0 text-gray-900 dark:text-white"
                            required={idx < 2}
                          />

                          {opt.isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md shrink-0">
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setIsAddingQuestion(false); resetQuestionForm(); }}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" size="sm" isLoading={addQuestionMutation.isPending}>
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Lưu câu hỏi này
                    </Button>
                  </div>
                </form>
              )}

              {/* Danh sách câu hỏi */}
              {(!quiz.questions || quiz.questions.length === 0) ? (
                <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Chưa có câu hỏi nào trong bài Quiz này
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Nhấn nút "Thêm câu hỏi" ở trên để bắt đầu thêm câu hỏi trắc nghiệm.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quiz.questions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 hover:shadow-xs transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {qIndex + 1}
                          </span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                            {q.content}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDeletingQuestionId(q.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Options list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 ml-8">
                        {q.options?.map((opt, optIndex) => {
                          const label = String.fromCharCode(65 + optIndex);
                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border ${
                                opt.isCorrect
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
                                  : 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700/60'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                opt.isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}>
                                {label}
                              </span>
                              <span className="truncate flex-1">{opt.content}</span>
                              {opt.isCorrect && (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KẾT QUẢ LÀM BÀI CỦA HỌC VIÊN */}
          {activeTab === 'ATTEMPTS' && (
            <div className="space-y-4">
              {loadingAttempts ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : totalAttempts === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
                  <Users className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-60" />
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Chưa có học viên nào nộp bài kiểm tra này
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Khi học viên hoàn thành bài kiểm tra trắc nghiệm, điểm số và chi tiết từng câu trả lời sẽ hiển thị tại đây.
                  </p>
                </div>
              ) : (
                <>
                  {/* Thống kê nhanh */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Lượt làm bài</div>
                      <div className="text-xl font-bold text-purple-900 dark:text-purple-200 mt-0.5">
                        {totalAttempts}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Điểm trung bình</div>
                      <div className="text-xl font-bold text-blue-900 dark:text-blue-200 mt-0.5">
                        {avgScore} <span className="text-xs font-normal opacity-70">/ 10</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Tỷ lệ đạt (≥5đ)</div>
                      <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                        {passRate}%
                        <span className="text-xs font-normal opacity-70 ml-1">({passedCount}/{totalAttempts})</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Điểm cao nhất</div>
                      <div className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-0.5">
                        {highestScore} <span className="text-xs font-normal opacity-70">/ 10</span>
                      </div>
                    </div>
                  </div>

                  {/* Bảng danh sách bài nộp */}
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/75 dark:bg-gray-850/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-4">Học viên</th>
                            <th className="py-3 px-4 text-center">Điểm số</th>
                            <th className="py-3 px-4 text-center">Số câu đúng</th>
                            <th className="py-3 px-4">Thời gian nộp</th>
                            <th className="py-3 px-4 text-right">Chi tiết</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
                          {attempts?.map((att) => (
                            <tr
                              key={att.id}
                              className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors"
                            >
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                                    {att.studentName?.charAt(0)?.toUpperCase() || 'H'}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                      {att.studentName}
                                    </div>
                                    <div className="text-xs text-gray-500 font-normal">
                                      {att.studentEmail || 'Chưa có email'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <Badge
                                  variant={
                                    att.score >= 8
                                      ? 'success'
                                      : att.score >= 5
                                      ? 'primary'
                                      : 'danger'
                                  }
                                >
                                  {att.score} / 10
                                </Badge>
                              </td>

                              <td className="py-3.5 px-4 text-center text-xs text-gray-600 dark:text-gray-300">
                                <span className="inline-flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                                  <Award className="w-3.5 h-3.5 text-primary-500" />
                                  {att.correctCount ?? 0} / {att.totalQuestions ?? (quiz.questions?.length ?? 0)}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  {new Date(att.submittedAt).toLocaleString('vi-VN')}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedAttemptId(att.id)}
                                  className="gap-1.5"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Xem bài làm
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Xác nhận xóa Quiz */}
      <ConfirmDialog
        isOpen={confirmDeleteQuiz}
        onClose={() => setConfirmDeleteQuiz(false)}
        onConfirm={handleDeleteQuiz}
        title="Xóa toàn bộ bài Quiz?"
        message="Hành động này sẽ xóa toàn bộ câu hỏi và đáp án của bài Quiz này. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Xác nhận xóa"
        type="danger"
        isLoading={deleteQuizMutation.isPending}
      />

      {/* Xác nhận xóa câu hỏi */}
      <ConfirmDialog
        isOpen={deletingQuestionId !== null}
        onClose={() => setDeletingQuestionId(null)}
        onConfirm={handleDeleteQuestion}
        title="Xóa câu hỏi này?"
        message="Câu hỏi này sẽ bị xóa vĩnh viễn khỏi bài Quiz."
        confirmText="Xóa"
        type="danger"
        isLoading={deleteQuestionMutation.isPending}
      />

      {/* Modal chi tiết kết quả làm bài của học viên */}
      <StudentAttemptDetailModal
        isOpen={selectedAttemptId !== null}
        onClose={() => setSelectedAttemptId(null)}
        attemptId={selectedAttemptId}
      />
    </Modal>
  );
};
