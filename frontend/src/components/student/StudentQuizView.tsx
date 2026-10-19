import { useState, useEffect } from 'react';
import { useLessonQuiz, useMyQuizAttempt, useSubmitQuizAttempt } from '../../hooks/useQuizHooks';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { HelpCircle, RotateCcw, Send, Award, Clock, Eye, EyeOff, CheckCircle, XCircle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface StudentQuizViewProps {
  lessonId: number;
  onCompletedQuiz?: () => void;
}

export const StudentQuizView = ({ lessonId, onCompletedQuiz }: StudentQuizViewProps) => {
  const { data: quiz, isLoading: loadingQuiz } = useLessonQuiz(lessonId);
  const { data: myAttempt, isLoading: loadingAttempt, refetch: refetchAttempt } = useMyQuizAttempt(quiz?.id ?? 0);
  const submitMutation = useSubmitQuizAttempt();

  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [isRetaking, setIsRetaking] = useState(false);
  const [showReview, setShowReview] = useState(true);

  useEffect(() => {
    setSelectedAnswers({});
    setIsRetaking(false);
  }, [lessonId, quiz?.id]);

  if (loadingQuiz || (quiz && loadingAttempt)) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return null; // Không có quiz cho bài này
  }

  const hasAttempted = !!myAttempt && !isRetaking;
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount < totalQuestions) {
      toast.error(`Bạn còn ${totalQuestions - answeredCount} câu hỏi chưa chọn đáp án`);
      return;
    }

    const payload = {
      answers: Object.entries(selectedAnswers).map(([qId, optId]) => ({
        questionId: Number(qId),
        selectedOptionId: optId,
      })),
    };

    submitMutation.mutate(
      { quizId: quiz.id, data: payload },
      {
        onSuccess: () => {
          refetchAttempt();
          setIsRetaking(false);
          if (onCompletedQuiz) onCompletedQuiz();
        },
      }
    );
  };

  return (
    <div className="border border-purple-200 dark:border-purple-900/40 rounded-xl bg-purple-50/20 dark:bg-purple-950/10 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-900/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {quiz.title}
            </h3>
            <p className="text-xs text-gray-500">
              Bài kiểm tra củng cố kiến thức ({totalQuestions} câu hỏi)
            </p>
          </div>
        </div>

        {hasAttempted && (
          <Badge variant={myAttempt.score >= 5 ? 'success' : 'warning'}>
            Đã làm bài: {myAttempt.score}/10 điểm
          </Badge>
        )}
      </div>

      {hasAttempted ? (
        /* Đã nộp bài: hiển thị bảng kết quả & xem lại đáp án */
        <div className="space-y-4">
          <div className="py-4 px-5 rounded-xl bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black ${
                  myAttempt.score >= 8
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : myAttempt.score >= 5
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  <span className="text-2xl leading-none">{myAttempt.score}</span>
                  <span className="text-[10px] font-semibold opacity-75 mt-0.5">/ 10</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                    {myAttempt.score >= 8
                      ? 'Xuất sắc! Bạn nắm kiến thức rất vững'
                      : myAttempt.score >= 5
                      ? 'Đạt yêu cầu! Bạn đã hoàn thành bài quiz'
                      : 'Chưa đạt! Bạn nên xem lại bài học và làm lại'}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap justify-center sm:justify-start">
                    <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                      <Award className="w-3.5 h-3.5 text-primary-500" />
                      Đúng {myAttempt.correctCount ?? 0} / {myAttempt.totalQuestions ?? totalQuestions} câu hỏi
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Nộp lúc: {new Date(myAttempt.submittedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowReview(!showReview)}
                  className="gap-1.5"
                >
                  {showReview ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Ẩn đáp án
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Xem lại bài làm
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedAnswers({});
                    setIsRetaking(true);
                  }}
                  className="gap-1.5 text-primary-600 border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-950/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Làm lại
                </Button>
              </div>
            </div>
          </div>

          {/* Màn hình xem lại đáp án chi tiết */}
          {showReview && myAttempt.answers && myAttempt.answers.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Chi tiết bài làm từng câu hỏi</span>
                  <span className="text-xs font-normal text-gray-500">
                    (Màu xanh lá: Đáp án đúng | Màu đỏ: Lựa chọn sai)
                  </span>
                </h4>
              </div>

              {myAttempt.answers.map((ans, idx) => {
                const questionObj = quiz.questions.find(q => q.id === ans.questionId);
                const optionsList = ans.options || questionObj?.options || [];

                return (
                  <div
                    key={ans.id || ans.questionId}
                    className={`p-4 rounded-xl border bg-white dark:bg-gray-800 space-y-3 transition-all ${
                      ans.isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900/40 shadow-xs'
                        : 'border-red-200 dark:border-red-900/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          ans.isCorrect
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                        }`}>
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

                    {/* Danh sách lựa chọn hiển thị trạng thái */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-8 pt-1">
                      {optionsList.map((opt, optIdx) => {
                        const isStudentChoice = ans.selectedOptionId === opt.id;
                        const isTheCorrectOption = opt.isCorrect || ans.correctOptionId === opt.id;
                        const label = String.fromCharCode(65 + optIdx);

                        let styleClasses = 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-850 text-gray-600 dark:text-gray-400';
                        let badgeElement = null;

                        if (isStudentChoice && isTheCorrectOption) {
                          // Học sinh chọn đúng
                          styleClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-medium';
                          badgeElement = (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                              <Check className="w-2.5 h-2.5" /> Bạn chọn (Đúng)
                            </span>
                          );
                        } else if (isStudentChoice && !isTheCorrectOption) {
                          // Học sinh chọn sai
                          styleClasses = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-2 ring-red-500/20 font-medium';
                          badgeElement = (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/60 px-1.5 py-0.5 rounded">
                              <X className="w-2.5 h-2.5" /> Bạn chọn (Sai)
                            </span>
                          );
                        } else if (isTheCorrectOption) {
                          // Đáp án đúng mà học sinh không chọn
                          styleClasses = 'border-emerald-400 border-dashed bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-medium';
                          badgeElement = (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                              <Check className="w-2.5 h-2.5" /> Đáp án đúng
                            </span>
                          );
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center justify-between p-3 rounded-lg text-xs border transition-all ${styleClasses}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                isStudentChoice && isTheCorrectOption
                                  ? 'bg-emerald-600 text-white'
                                  : isStudentChoice && !isTheCorrectOption
                                  ? 'bg-red-600 text-white'
                                  : isTheCorrectOption
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}>
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
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Form làm bài Quiz */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {quiz.questions.map((question, qIdx) => (
              <div
                key={question.id}
                className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">
                    {question.content}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 pl-8">
                  {question.options?.map((option, optIdx) => {
                    const isSelected = selectedAnswers[question.id] === option.id;
                    const label = String.fromCharCode(65 + optIdx);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(question.id, option.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left text-xs font-medium border transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-500 ring-2 ring-purple-600/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-850 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {label}
                        </span>
                        <span className="flex-1 leading-snug">{option.content}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              Đã trả lời: <strong className="text-purple-600">{answeredCount}/{totalQuestions}</strong> câu hỏi
            </span>

            <Button
              type="submit"
              disabled={answeredCount < totalQuestions}
              isLoading={submitMutation.isPending}
              className="gap-2"
            >
              <Send className="w-4 h-4" /> Nộp bài trắc nghiệm
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
