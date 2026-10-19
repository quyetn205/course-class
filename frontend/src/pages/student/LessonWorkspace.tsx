import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCourseProgress, useCompleteLesson } from '../../hooks/useStudentHooks';
import { useClassroom } from '../../hooks/useClassroomHooks';
import { useLessonQuiz } from '../../hooks/useQuizHooks';
import { useLessonAssignment } from '../../hooks/useAssignmentHooks';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { VideoPlayer } from '../../components/common/VideoPlayer';
import { PdfViewer } from '../../components/common/PdfViewer';
import { StudentQuizView } from '../../components/student/StudentQuizView';
import { StudentAssignmentView } from '../../components/student/StudentAssignmentView';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle, 
  Lock, 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  ClipboardList, 
  Menu, 
  X, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const LessonWorkspace = () => {
  const { classId, lessonId } = useParams<{ classId: string; lessonId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentLessonId = Number(lessonId);
  const { data: classroom, isLoading: loadingClass } = useClassroom(Number(classId));
  const courseId = classroom?.courseId;
  const { data: progress, isLoading: loadingProgress, refetch: refetchProgress } = useCourseProgress(courseId ?? 0);
  const completeMutation = useCompleteLesson();

  // Sidebar lộ trình (mở mặc định trên màn hình rộng)
  const [showSidebar, setShowSidebar] = useState(true);

  // Tab: 'content' | 'quiz' | 'assignment'
  const initialTab = (searchParams.get('tab') as 'content' | 'quiz' | 'assignment') || 'content';
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'assignment'>(initialTab);

  // Lấy thông tin Quiz và Assignment để hiện badge trên Tab
  const { data: quizData } = useLessonQuiz(currentLessonId);
  const { data: assignmentData } = useLessonAssignment(currentLessonId);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'content' | 'quiz' | 'assignment';
    if (tabParam && ['content', 'quiz', 'assignment'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'content' | 'quiz' | 'assignment') => {
    setActiveTab(tab);
    setSearchParams(tab === 'content' ? {} : { tab });
  };

  if (loadingClass || loadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  const lessons = progress ?? [];
  const completedCount = lessons.filter((l) => l.status === 'COMPLETED').length;
  const totalCount = lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Tìm bài học hiện tại
  const currentIndex = lessons.findIndex((l) => l.lessonId === currentLessonId);
  const currentLesson = currentIndex >= 0 ? lessons[currentIndex] : lessons[0];

  // Nếu URL không có hoặc sai lessonId, tự động chuyển về bài học đầu tiên/hợp lệ
  if (!currentLesson && lessons.length > 0) {
    navigate(`/student/classes/${classId}/learn/${lessons[0].lessonId}`, { replace: true });
    return null;
  }

  const isCurrentCompleted = currentLesson?.status === 'COMPLETED';
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Kiểm tra bài tiếp theo có bị khóa không
  const isNextLocked = nextLesson ? !isCurrentCompleted && nextLesson.status !== 'COMPLETED' : true;

  const handleCompleteCurrentLesson = () => {
    if (!currentLesson) return;
    completeMutation.mutate(currentLesson.lessonId, {
      onSuccess: () => {
        refetchProgress();
      },
    });
  };

  const handleNavigateLesson = (targetLessonId: number) => {
    navigate(`/student/classes/${classId}/learn/${targetLessonId}`);
  };

  const isVideo = currentLesson?.lessonType === 'VIDEO' || !!currentLesson?.videoUrl;
  const isPdf = !isVideo && (currentLesson?.lessonType === 'PDF' || !!currentLesson?.fileUrl);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top Bar - Header chuẩn LMS */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 sticky top-0 shadow-xs">
        {/* Cột trái: Quay lại & Tên lớp/bài */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/student/classes/${classId}/progress`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            title="Quay lại lộ trình khóa học"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lớp học</span>
          </Link>

          <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
              {currentLesson?.lessonTitle}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden md:block">
              {classroom?.courseName} • {classroom?.name}
            </p>
          </div>
        </div>

        {/* Cột phải: Tiến độ học tập & Toggle Sidebar */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Progress bar mini */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
              {progressPercent}%
            </span>
          </div>

          {/* Nút Previous / Next bài học */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={!prevLesson}
              onClick={() => prevLesson && handleNavigateLesson(prevLesson.lessonId)}
              title={prevLesson ? `Bài trước: ${prevLesson.lessonTitle}` : 'Không có bài trước'}
              className="p-2 sm:px-3"
            >
              <ChevronLeft className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Bài trước</span>
            </Button>

            <Button
              size="sm"
              variant="primary"
              disabled={!nextLesson || isNextLocked}
              onClick={() => nextLesson && handleNavigateLesson(nextLesson.lessonId)}
              title={
                !nextLesson
                  ? 'Đã là bài cuối cùng'
                  : isNextLocked
                  ? 'Hoàn thành bài này để mở bài tiếp theo'
                  : `Bài tiếp theo: ${nextLesson.lessonTitle}`
              }
              className="p-2 sm:px-3"
            >
              <span className="hidden sm:inline">Bài tiếp</span>
              <ChevronRight className="w-4 h-4 sm:ml-1" />
            </Button>
          </div>

          <div className="h-5 w-px bg-gray-200 dark:bg-gray-800" />

          {/* Toggle Sidebar lộ trình */}
          <button
            type="button"
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              showSidebar
                ? 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-950/40 dark:border-primary-900/50'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Đóng / mở danh sách bài học"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden xl:inline">Lộ trình ({completedCount}/{totalCount})</span>
          </button>
        </div>
      </header>

      {/* Body: Sidebar + Main Content Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Khu vực trung tâm: Toàn màn hình rộng rãi cho việc học */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          <div className="w-full max-w-5xl space-y-6">
            {/* Header bài học & Selector Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                      isVideo
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : isPdf
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    {isVideo ? <Video className="w-4 h-4" /> : isPdf ? <FileText className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    {isVideo
                      ? `Video bài giảng ${currentLesson?.duration ? `(${currentLesson.duration} phút)` : ''}`
                      : isPdf
                      ? 'Tài liệu PDF'
                      : 'Bài đọc lý thuyết'}
                  </span>

                  {isCurrentCompleted ? (
                    <Badge variant="success">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> Đã hoàn thành
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <Circle className="w-3.5 h-3.5 mr-1 inline" /> Đang học
                    </Badge>
                  )}
                </div>

                {!isCurrentCompleted && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleCompleteCurrentLesson}
                    isLoading={completeMutation.isPending}
                    className="self-start sm:self-auto gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Đánh dấu đã hoàn thành bài học
                  </Button>
                )}
              </div>

              {/* Tabs lớn chuyển đổi chế độ học: Bài học | Quiz | Bài tập */}
              <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800/70 rounded-xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => handleTabChange('content')}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'content'
                      ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Tài liệu bài học</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('quiz')}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'quiz'
                      ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Trắc nghiệm (Quiz)</span>
                  {quizData && quizData.questions && quizData.questions.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-extrabold">
                      {quizData.questions.length} câu
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('assignment')}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'assignment'
                      ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Bài tập nộp file</span>
                  {assignmentData && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold">
                      Có bài tập
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tab 1: Nội dung bài học (Video / PDF / Text) */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Khung Video */}
                {isVideo && currentLesson?.videoUrl && (
                  <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-800">
                    <VideoPlayer
                      videoUrl={currentLesson.videoUrl}
                      title={currentLesson.lessonTitle}
                      duration={currentLesson.duration}
                      height="520px"
                    />
                  </div>
                )}

                {/* Khung PDF */}
                {isPdf && currentLesson?.fileUrl && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
                    <PdfViewer
                      fileUrl={currentLesson.fileUrl}
                      fileName={currentLesson.fileName || `${currentLesson.lessonTitle}.pdf`}
                      title={currentLesson.lessonTitle}
                      height="750px"
                    />
                  </div>
                )}

                {/* Nội dung bài học dạng Text / Mô tả */}
                {currentLesson?.lessonContent ? (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary-600" />
                      Ghi chú & Hướng dẫn bài học
                    </h3>
                    <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {currentLesson.lessonContent}
                    </div>
                  </div>
                ) : (
                  !isVideo && !isPdf && (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Bài học này hiện chưa có nội dung văn bản.
                      </p>
                    </div>
                  )
                )}

                {/* Thanh điều hướng chân trang */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div>
                    {isCurrentCompleted ? (
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Bạn đã hoàn thành bài học này
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Sau khi học xong nội dung, hãy nhấn nút bên cạnh để ghi nhận tiến độ.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {!isCurrentCompleted && (
                      <Button
                        onClick={handleCompleteCurrentLesson}
                        isLoading={completeMutation.isPending}
                        className="flex-1 sm:flex-initial"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Đánh dấu hoàn thành
                      </Button>
                    )}

                    {nextLesson && !isNextLocked && (
                      <Button
                        variant="primary"
                        onClick={() => handleNavigateLesson(nextLesson.lessonId)}
                        className="flex-1 sm:flex-initial"
                      >
                        Bài tiếp theo <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Làm bài kiểm tra Quiz (Toàn màn hình thoáng đãng) */}
            {activeTab === 'quiz' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xs">
                {quizData && quizData.questions && quizData.questions.length > 0 ? (
                  <StudentQuizView
                    lessonId={currentLesson.lessonId}
                    onCompletedQuiz={() => {
                      handleCompleteCurrentLesson();
                    }}
                  />
                ) : (
                  <div className="text-center py-16">
                    <HelpCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      Không có bài kiểm tra Quiz
                    </h4>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Bài học này không có câu hỏi trắc nghiệm. Bạn có thể chuyển sang tab tài liệu hoặc bài tập để tiếp tục.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Bài tập nộp file (Assignment) */}
            {activeTab === 'assignment' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xs">
                {assignmentData ? (
                  <StudentAssignmentView lessonId={currentLesson.lessonId} />
                ) : (
                  <div className="text-center py-16">
                    <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      Không có bài tập thực hành
                    </h4>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Bài học này không yêu cầu nộp file bài tập. Bạn có thể tiếp tục các bài học khác trong lộ trình.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Sidebar lộ trình khóa học (Collapsible Drawer) */}
        {showSidebar && (
          <aside className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0 z-10 shadow-lg lg:shadow-none transition-all">
            {/* Header Sidebar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Lộ trình bài học
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Đã hoàn thành {completedCount}/{totalCount} bài ({progressPercent}%)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSidebar(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Đóng sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Danh sách bài học */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {lessons.map((lesson, idx) => {
                const isItemCompleted = lesson.status === 'COMPLETED';
                const isItemLocked = idx > 0 && lessons[idx - 1].status !== 'COMPLETED';
                const isCurrent = lesson.lessonId === currentLesson.lessonId;
                const isItemVideo = lesson.lessonType === 'VIDEO' || !!lesson.videoUrl;
                const isItemPdf = !isItemVideo && (lesson.lessonType === 'PDF' || !!lesson.fileUrl);

                return (
                  <div
                    key={lesson.lessonId}
                    onClick={() => {
                      if (!isItemLocked) {
                        handleNavigateLesson(lesson.lessonId);
                      }
                    }}
                    className={`p-3.5 flex items-start gap-3 transition-colors ${
                      isCurrent
                        ? 'bg-primary-50/80 dark:bg-primary-950/40 border-l-4 border-primary-600'
                        : isItemLocked
                        ? 'opacity-50 cursor-not-allowed bg-gray-50/30 dark:bg-gray-900/30'
                        : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isItemCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : isItemLocked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Circle className={`w-4 h-4 ${isCurrent ? 'text-primary-600' : 'text-gray-400'}`} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold leading-snug line-clamp-2 ${
                          isCurrent
                            ? 'text-primary-700 dark:text-primary-300 font-bold'
                            : isItemLocked
                            ? 'text-gray-400'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {idx + 1}. {lesson.lessonTitle}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                          {isItemVideo ? (
                            <>
                              <Video className="w-3 h-3 text-purple-500" />
                              Video {lesson.duration ? `(${lesson.duration}p)` : ''}
                            </>
                          ) : isItemPdf ? (
                            <>
                              <FileText className="w-3 h-3 text-red-500" />
                              PDF
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3 h-3 text-blue-500" />
                              Bài đọc
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
