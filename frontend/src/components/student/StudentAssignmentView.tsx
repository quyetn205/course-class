import { useState } from 'react';
import { useLessonAssignment, useMySubmission, useSubmitAssignment } from '../../hooks/useAssignmentHooks';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { FileUpload } from '../common/FileUpload';
import { ClipboardList, Calendar, Award, CheckCircle, Download, Send, RotateCcw, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api/axiosClient';

interface StudentAssignmentViewProps {
  lessonId: number;
}

export const StudentAssignmentView = ({ lessonId }: StudentAssignmentViewProps) => {
  const { data: assignment, isLoading: loadingAssignment } = useLessonAssignment(lessonId);
  const { data: mySubmission, isLoading: loadingSub, refetch: refetchSub } = useMySubmission(assignment?.id ?? 0);
  const submitMutation = useSubmitAssignment();

  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isResubmitting, setIsResubmitting] = useState(false);

  const isDeadlinePassed = assignment?.deadline
    ? new Date(assignment.deadline).getTime() < Date.now()
    : false;

  if (loadingAssignment || (assignment && loadingSub)) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!assignment) {
    return null; // Không có bài tập cho bài học này
  }

  const isGraded = mySubmission?.status === 'GRADED';
  const hasSubmitted = !!mySubmission && !isResubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileUrl) {
      toast.error('Vui lòng tải lên file bài làm trước khi nộp');
      return;
    }

    submitMutation.mutate(
      {
        assignmentId: assignment.id,
        data: { file: uploadedFileUrl },
      },
      {
        onSuccess: () => {
          refetchSub();
          setIsResubmitting(false);
          setUploadedFileUrl('');
          setUploadedFileName('');
        },
      }
    );
  };

  return (
    <div className="border border-emerald-200 dark:border-emerald-900/40 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/10 p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {assignment.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
              {assignment.deadline && (
                <span className={`flex items-center gap-1 font-medium ${isDeadlinePassed ? 'text-red-500' : 'text-gray-500'}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  Hạn nộp: {new Date(assignment.deadline).toLocaleString('vi-VN')}
                  {isDeadlinePassed && (
                    <span className="bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] px-1.5 py-0.5 rounded ml-1 font-bold">
                      HẾT HẠN
                    </span>
                  )}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Điểm tối đa: {assignment.maxScore ?? 10} điểm
              </span>
            </div>
          </div>
        </div>

        {hasSubmitted && (
          <div className="flex items-center gap-2">
            {mySubmission.isLate && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                Nộp muộn
              </span>
            )}
            <Badge variant={isGraded ? 'success' : 'primary'}>
              {isGraded ? `Điểm: ${mySubmission.score}/${assignment.maxScore ?? 10}` : 'Đã nộp bài (Chờ chấm)'}
            </Badge>
          </div>
        )}
      </div>

      {hasSubmitted ? (
        /* Đã nộp bài */
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  Bạn đã nộp bài tập này
                </span>
                {mySubmission.isLate && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    Nộp muộn
                  </span>
                )}
              </div>

              {mySubmission.submittedAt && (
                <div className="pl-7 text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Thời gian nộp: {new Date(mySubmission.submittedAt).toLocaleString('vi-VN')}
                </div>
              )}

              {mySubmission.file && (
                <div className="pl-7 pt-1">
                  <a
                    href={mySubmission.file.startsWith('http') ? mySubmission.file : `${API_BASE_URL}${mySubmission.file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Xem file bài làm đã nộp
                  </a>
                </div>
              )}
            </div>

            {!isGraded && !isDeadlinePassed && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsResubmitting(true)}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Nộp lại bài khác
              </Button>
            )}
            {!isGraded && isDeadlinePassed && (
              <span className="text-xs text-gray-400 italic">Hết hạn nộp lại</span>
            )}
          </div>

          {isGraded && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <Award className="w-4 h-4 text-emerald-600" />
                Kết quả chấm điểm: {mySubmission.score} / {assignment.maxScore ?? 10} điểm
              </div>
              {mySubmission.comment && (
                <p className="text-gray-700 dark:text-gray-300 italic pl-6">
                  Lời nhận xét từ giảng viên: "{mySubmission.comment}"
                </p>
              )}
            </div>
          )}
        </div>
      ) : isDeadlinePassed ? (
        /* Hết hạn nộp bài */
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 flex items-center gap-2.5 text-xs sm:text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Bài tập này đã kết thúc thời hạn nộp vào lúc <strong>{new Date(assignment.deadline!).toLocaleString('vi-VN')}</strong>. Bạn không thể nộp bài tập này vào lúc này.</span>
        </div>
      ) : (
        /* Form nộp bài tập */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Tải lên file bài làm của bạn (PDF, ZIP, Word, Code...):
            </label>
            <FileUpload
              accept="*/*"
              maxSizeMB={50}
              folder="assignments"
              onFileUploaded={(url: string, name: string) => {
                setUploadedFileUrl(url);
                setUploadedFileName(name);
              }}
              currentFileUrl={uploadedFileUrl}
              currentFileName={uploadedFileName}
              onFileRemoved={() => {
                setUploadedFileUrl('');
                setUploadedFileName('');
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            {isResubmitting && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsResubmitting(false)}
              >
                Hủy nộp lại
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={!uploadedFileUrl}
              isLoading={submitMutation.isPending}
              className="gap-1.5"
            >
              <Send className="w-4 h-4" /> Nộp bài tập
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
