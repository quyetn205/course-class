import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseProgress } from '../../hooks/useStudentHooks';
import { useClassroom } from '../../hooks/useClassroomHooks';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StudentGradebookView } from '../../components/student/StudentGradebookView';
import type { LessonProgressResponse } from '../../types/assignment';
import { CheckCircle, Circle, Lock, BookOpen, PlayCircle, Award, ArrowRight, ArrowLeft } from 'lucide-react';

export const CourseProgress = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { data: classroom, isLoading: loadingClass } = useClassroom(Number(classId));
  const courseId = classroom?.courseId;
  const { data: progress, isLoading: loadingProgress } = useCourseProgress(courseId ?? 0);

  const [mainTab, setMainTab] = useState<'LESSONS' | 'GRADES'>('LESSONS');

  if (loadingClass || loadingProgress) return <LoadingSpinner />;

  const lessons = progress ?? [];
  const completedCount = lessons.filter(l => l.status === 'COMPLETED').length;
  const totalCount = lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const firstUncompleted = lessons.find(l => l.status !== 'COMPLETED') || lessons[0];

  const handleOpenLesson = (lesson: LessonProgressResponse, isLocked: boolean) => {
    if (isLocked) return;
    navigate(`/student/classes/${classId}/learn/${lesson.lessonId}`);
  };

  return (
    <div>
      <button onClick={() => navigate('/student/classes')} className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-4 font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp
      </button>

      {/* Class Info & Quick Continue Card */}
      {classroom && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{classroom.name}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{classroom.courseName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right shrink-0">
                  <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{progressPercent}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{completedCount}/{totalCount} bài hoàn thành</p>
                </div>

                {firstUncompleted && (
                  <Button
                    onClick={() => navigate(`/student/classes/${classId}/learn/${firstUncompleted.lessonId}`)}
                    className="gap-2 shadow-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{completedCount === 0 ? 'Bắt đầu học' : 'Tiếp tục bài học'}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6">
        <button
          type="button"
          onClick={() => setMainTab('LESSONS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            mainTab === 'LESSONS'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Lộ trình bài học ({totalCount} bài)
        </button>
        <button
          type="button"
          onClick={() => setMainTab('GRADES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            mainTab === 'GRADES'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Bảng điểm của tôi (My Grades)
        </button>
      </div>

      {mainTab === 'LESSONS' ? (
        lessons.length === 0 ? (
          <EmptyState title="Chưa có bài học" description="Khóa học này chưa có bài học nào." />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Danh sách bài học</h2>
                <span className="text-xs text-gray-500">Nhấp vào bài học đã mở để vào không gian học tập</span>
              </div>
            </CardHeader>
            <CardBody className="divide-y divide-gray-100 dark:divide-gray-700/60 p-0">
              {lessons.map((lesson, index) => {
                const isCompleted = lesson.status === 'COMPLETED';
                const isLocked = index > 0 && lessons[index - 1].status !== 'COMPLETED';
                const isVideo = lesson.lessonType === 'VIDEO' || !!lesson.videoUrl;
                const isPdf = !isVideo && (lesson.lessonType === 'PDF' || !!lesson.fileUrl);

                return (
                  <div
                    key={lesson.lessonId}
                    onClick={() => handleOpenLesson(lesson, isLocked)}
                    className={`flex items-center justify-between px-6 py-4 transition-colors ${
                      isLocked
                        ? 'opacity-60 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/20'
                        : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium truncate ${isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                            {index + 1}. {lesson.lessonTitle}
                          </p>
                          {isVideo ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 shrink-0">
                              <PlayCircle className="w-3 h-3" />
                              Video {lesson.duration ? `(${lesson.duration}p)` : ''}
                            </span>
                          ) : isPdf ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 shrink-0">
                              PDF
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shrink-0">
                              Text
                            </span>
                          )}
                        </div>
                        {isCompleted && lesson.completedAt && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Đã học: {new Date(lesson.completedAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {isCompleted ? (
                        <Badge variant="success">Đã hoàn thành</Badge>
                      ) : isLocked ? (
                        <Badge variant="default">Chưa mở</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLesson(lesson, false);
                          }}
                          className="gap-1.5"
                        >
                          Vào học
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        )
      ) : (
        <StudentGradebookView classId={Number(classId)} />
      )}
    </div>
  );
};


