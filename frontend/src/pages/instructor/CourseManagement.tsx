import { useState } from 'react';
import { useCourses, useCreateCourse, useUpdateCourse, usePublishCourse, useCloneCourse, useDeleteCourse,
         useCreateChapter, useUpdateChapter, useDeleteChapter, useCreateLesson, useUpdateLesson, useDeleteLesson } from '../../hooks/useCourseHooks';
import { useCategories } from '../../hooks/useCategoryHooks';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { FileUpload } from '../../components/common/FileUpload';
import { PdfViewer } from '../../components/common/PdfViewer';
import { VideoPlayer } from '../../components/common/VideoPlayer';
import { QuizManagerModal } from '../../components/instructor/QuizManagerModal';
import { AssignmentManagerModal } from '../../components/instructor/AssignmentManagerModal';
import type { CourseResponse, ChapterResponse, LessonResponse } from '../../types/course';
import { Plus, Edit, Send, BookOpen, ChevronDown, ChevronUp, FileText, Trash2, Eye, FileCheck, Video, PlayCircle, HelpCircle, ClipboardList, Copy } from 'lucide-react';

export const CourseManagement = () => {
  const [page, setPage] = useState(0);
  const { data: coursesData, isLoading } = useCourses({ page, size: 10 });
  const { data: categories } = useCategories();

  // Course modals
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [publishingCourse, setPublishingCourse] = useState<CourseResponse | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseResponse | null>(null);
  const [cloningCourse, setCloningCourse] = useState<CourseResponse | null>(null);
  const [cloneTitle, setCloneTitle] = useState('');

  // Chapter modals
  const [showCreateChapter, setShowCreateChapter] = useState<number | null>(null); // courseId
  const [editingChapter, setEditingChapter] = useState<ChapterResponse | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<{ id: number; title: string } | null>(null);

  // Lesson modals
  const [showCreateLesson, setShowCreateLesson] = useState<number | null>(null); // chapterId
  const [editingLesson, setEditingLesson] = useState<LessonResponse | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{ id: number; title: string } | null>(null);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; title: string; fileName: string } | null>(null);
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string; duration?: number | null } | null>(null);
  const [managingQuizLesson, setManagingQuizLesson] = useState<{ id: number; title: string } | null>(null);
  const [managingAssignmentLesson, setManagingAssignmentLesson] = useState<{ id: number; title: string } | null>(null);

  // Expand course detail
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    goal: '',
    categoryId: '',
    thumbnailUrl: '',
    level: 'ALL_LEVELS',
    prerequisites: '',
  });

  const [chapterForm, setChapterForm] = useState({ title: '', orderNo: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    orderNo: '',
    lessonType: 'TEXT' as 'TEXT' | 'PDF' | 'VIDEO',
    fileUrl: '',
    fileName: '',
    videoUrl: '',
    duration: '',
  });

  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();
  const publishCourseMutation = usePublishCourse();
  const cloneCourseMutation = useCloneCourse();
  const createChapterMutation = useCreateChapter();
  const updateChapterMutation = useUpdateChapter();
  const deleteChapterMutation = useDeleteChapter();
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

  const categoryOptions = (categories ?? []).map(c => ({ value: c.id, label: c.name }));

  const levelOptions = [
    { value: 'ALL_LEVELS', label: 'Tất cả cấp độ' },
    { value: 'BEGINNER', label: 'Cơ bản (Beginner)' },
    { value: 'INTERMEDIATE', label: 'Trung cấp (Intermediate)' },
    { value: 'ADVANCED', label: 'Nâng cao (Advanced)' },
  ];

  const handleCreateCourse = () => {
    createCourseMutation.mutate({
      title: courseForm.title,
      description: courseForm.description || undefined,
      goal: courseForm.goal || undefined,
      categoryId: Number(courseForm.categoryId),
      thumbnailUrl: courseForm.thumbnailUrl || undefined,
      level: courseForm.level || 'ALL_LEVELS',
      prerequisites: courseForm.prerequisites || undefined,
    }, {
      onSuccess: () => {
        setShowCreateCourse(false);
        setCourseForm({ title: '', description: '', goal: '', categoryId: '', thumbnailUrl: '', level: 'ALL_LEVELS', prerequisites: '' });
      },
    });
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;
    updateCourseMutation.mutate({
      id: editingCourse.id,
      data: {
        title: courseForm.title,
        description: courseForm.description || undefined,
        goal: courseForm.goal || undefined,
        categoryId: Number(courseForm.categoryId),
        thumbnailUrl: courseForm.thumbnailUrl || undefined,
        level: courseForm.level || 'ALL_LEVELS',
        prerequisites: courseForm.prerequisites || undefined,
      },
    }, {
      onSuccess: () => setEditingCourse(null),
    });
  };

  const openEditCourse = (c: CourseResponse) => {
    setEditingCourse(c);
    setCourseForm({
      title: c.title,
      description: c.description || '',
      goal: c.goal || '',
      categoryId: String(c.categoryId),
      thumbnailUrl: c.thumbnailUrl || '',
      level: c.level || 'ALL_LEVELS',
      prerequisites: c.prerequisites || '',
    });
  };

  const openCloneCourseModal = (course: CourseResponse, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCloningCourse(course);
    setCloneTitle(`[Bản sao] ${course.title}`);
  };

  const handleConfirmClone = () => {
    if (!cloningCourse) return;
    cloneCourseMutation.mutate({
      id: cloningCourse.id,
      title: cloneTitle.trim() || undefined,
    }, {
      onSuccess: () => {
        setCloningCourse(null);
        setCloneTitle('');
      },
    });
  };

  const handleCreateChapter = () => {
    if (!showCreateChapter) return;
    createChapterMutation.mutate({
      courseId: showCreateChapter,
      data: { title: chapterForm.title, orderNo: Number(chapterForm.orderNo) },
    }, {
      onSuccess: () => {
        setShowCreateChapter(null);
        setChapterForm({ title: '', orderNo: '' });
      },
    });
  };

  const handleUpdateChapter = () => {
    if (!editingChapter) return;
    updateChapterMutation.mutate({
      id: editingChapter.id,
      data: { title: chapterForm.title, orderNo: Number(chapterForm.orderNo) },
    }, {
      onSuccess: () => setEditingChapter(null),
    });
  };

  const handleCreateLesson = () => {
    if (!showCreateLesson) return;
    createLessonMutation.mutate({
      chapterId: showCreateLesson,
      data: {
        title: lessonForm.title,
        content: lessonForm.content || undefined,
        orderNo: Number(lessonForm.orderNo),
        lessonType: lessonForm.lessonType,
        fileUrl: lessonForm.fileUrl || undefined,
        fileName: lessonForm.fileName || undefined,
        videoUrl: lessonForm.videoUrl || undefined,
        duration: lessonForm.duration ? Number(lessonForm.duration) : undefined,
      },
    }, {
      onSuccess: () => {
        setShowCreateLesson(null);
        setLessonForm({
          title: '',
          content: '',
          orderNo: '',
          lessonType: 'TEXT',
          fileUrl: '',
          fileName: '',
          videoUrl: '',
          duration: '',
        });
      },
    });
  };

  const handleUpdateLesson = () => {
    if (!editingLesson) return;
    updateLessonMutation.mutate({
      id: editingLesson.id,
      data: {
        title: lessonForm.title,
        content: lessonForm.content || undefined,
        orderNo: Number(lessonForm.orderNo),
        lessonType: lessonForm.lessonType,
        fileUrl: lessonForm.fileUrl || undefined,
        fileName: lessonForm.fileName || undefined,
        videoUrl: lessonForm.videoUrl || undefined,
        duration: lessonForm.duration ? Number(lessonForm.duration) : undefined,
      },
    }, {
      onSuccess: () => setEditingLesson(null),
    });
  };

  const openCreateLesson = (chapterId: number, nextOrder: number) => {
    setLessonForm({
      title: '',
      content: '',
      orderNo: String(nextOrder),
      lessonType: 'TEXT',
      fileUrl: '',
      fileName: '',
      videoUrl: '',
      duration: '',
    });
    setShowCreateLesson(chapterId);
  };

  const openEditLesson = (lesson: LessonResponse) => {
    setEditingLesson(lesson);
    const resolvedType = (lesson.lessonType || (lesson.videoUrl ? 'VIDEO' : lesson.fileUrl ? 'PDF' : 'TEXT')) as 'TEXT' | 'PDF' | 'VIDEO';
    setLessonForm({
      title: lesson.title,
      content: lesson.content || '',
      orderNo: String(lesson.orderNo),
      lessonType: resolvedType,
      fileUrl: lesson.fileUrl || '',
      fileName: lesson.fileName || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration ? String(lesson.duration) : '',
    });
  };

  if (isLoading) return <LoadingSpinner />;

  const courses = coursesData?.content ?? [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Khóa học của tôi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý nội dung khóa học, chương và bài học</p>
        </div>
        <Button onClick={() => { setCourseForm({ title: '', description: '', goal: '', categoryId: '', thumbnailUrl: '', level: 'ALL_LEVELS', prerequisites: '' }); setShowCreateCourse(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Tạo khóa học
        </Button>
      </div>

      {courses.length === 0 ? (
        <EmptyState title="Chưa có khóa học" description="Tạo khóa học đầu tiên của bạn." />
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors" onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl.startsWith('http') ? course.thumbnailUrl : course.thumbnailUrl}
                        alt={course.title}
                        className="w-14 h-14 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-100 dark:border-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{course.title}</h3>
                        {course.level && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {course.level === 'BEGINNER' ? 'Cơ bản' : course.level === 'INTERMEDIATE' ? 'Trung cấp' : course.level === 'ADVANCED' ? 'Nâng cao' : 'Mọi cấp độ'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{course.categoryName} · {course.chapters?.length ?? 0} chương</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => openCloneCourseModal(course, e)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      title="Nhân bản khóa học làm mẫu (Clone)"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <Badge variant={course.status === 'PUBLISHED' ? 'success' : 'warning'}>
                      {course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                    </Badge>
                    {expandedCourse === course.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </CardHeader>

              {expandedCourse === course.id && (
                <CardBody className="border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button size="sm" variant="outline" onClick={() => openEditCourse(course)}>
                      <Edit className="w-3.5 h-3.5 mr-1" /> Sửa khóa học
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openCloneCourseModal(course)}
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 dark:border-indigo-800 dark:text-indigo-400"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" /> Nhân bản (Clone)
                    </Button>
                    {course.status === 'DRAFT' && (
                      <Button size="sm" variant="outline" onClick={() => setPublishingCourse(course)}>
                        <Send className="w-3.5 h-3.5 mr-1" /> Xuất bản
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingCourse(course)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-800 dark:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setChapterForm({ title: '', orderNo: String((course.chapters?.length ?? 0) + 1) }); setShowCreateChapter(course.id); }}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Thêm chương
                    </Button>
                  </div>

                  {course.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{course.description}</p>}
                  {course.prerequisites && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                      <strong>Yêu cầu đầu vào:</strong> {course.prerequisites}
                    </p>
                  )}

                  {/* Chapters */}
                  <div className="space-y-3">
                    {(course.chapters ?? []).sort((a, b) => a.orderNo - b.orderNo).map((chapter) => (
                      <div key={chapter.id} className="border border-gray-200 dark:border-gray-700/80 rounded-xl p-4 bg-white dark:bg-gray-850">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 font-bold">
                              {chapter.orderNo}
                            </span>
                            <span>{chapter.title}</span>
                          </h4>
                          <div className="flex gap-1">
                            <button
                              onClick={() => { setEditingChapter(chapter); setChapterForm({ title: chapter.title, orderNo: String(chapter.orderNo) }); }}
                              className="p-1.5 rounded text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Sửa chương"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingChapter({ id: chapter.id, title: chapter.title })}
                              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Xóa chương"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openCreateLesson(chapter.id, (chapter.lessons?.length ?? 0) + 1)}
                              className="p-1.5 rounded text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Thêm bài học"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Lessons */}
                        <div className="space-y-1.5 ml-1 sm:ml-3">
                          {(chapter.lessons ?? []).sort((a, b) => a.orderNo - b.orderNo).map((lesson) => {
                            const isPdf = lesson.lessonType === 'PDF' || !!lesson.fileUrl;
                            const isVideo = lesson.lessonType === 'VIDEO' || !!lesson.videoUrl;
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`p-1.5 rounded-md shrink-0 ${
                                    isVideo
                                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                                      : isPdf
                                      ? 'bg-red-50 dark:bg-red-950/40 text-red-500'
                                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-500'
                                  }`}>
                                    {isVideo ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                  </div>
                                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                      {lesson.orderNo}. {lesson.title}
                                    </span>
                                    {isVideo ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                        <PlayCircle className="w-3 h-3" />
                                        Video {lesson.duration ? `(${lesson.duration}p)` : ''}
                                      </span>
                                    ) : isPdf ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                                        PDF
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                        Text
                                      </span>
                                    )}
                                    {lesson.locked && <Badge variant="warning">Khóa</Badge>}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  {isVideo && lesson.videoUrl && (
                                    <button
                                      onClick={() => setPreviewVideo({
                                        url: lesson.videoUrl!,
                                        title: lesson.title,
                                        duration: lesson.duration,
                                      })}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-purple-600 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-md transition-colors"
                                      title="Xem trước Video bài giảng"
                                    >
                                      <PlayCircle className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Xem Video</span>
                                    </button>
                                  )}
                                  {isPdf && lesson.fileUrl && (
                                    <button
                                      onClick={() => setPreviewPdf({
                                        url: lesson.fileUrl!,
                                        title: lesson.title,
                                        fileName: lesson.fileName || 'Tài liệu bài học.pdf',
                                      })}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded-md transition-colors"
                                      title="Xem trước file PDF"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Xem PDF</span>
                                    </button>
                                  )}

                                  {/* Nút quản lý Quiz trắc nghiệm */}
                                  <button
                                    onClick={() => setManagingQuizLesson({ id: lesson.id, title: lesson.title })}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 rounded-md transition-colors font-medium border border-purple-200/70 dark:border-purple-800/50"
                                    title="Tạo & quản lý câu hỏi trắc nghiệm (Quiz)"
                                  >
                                    <HelpCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                    <span>Quiz</span>
                                  </button>

                                  {/* Nút quản lý Bài tập nộp file */}
                                  <button
                                    onClick={() => setManagingAssignmentLesson({ id: lesson.id, title: lesson.title })}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-md transition-colors font-medium border border-emerald-200/70 dark:border-emerald-800/50"
                                    title="Tạo & quản lý bài tập nộp file"
                                  >
                                    <ClipboardList className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Bài tập</span>
                                  </button>

                                  <button
                                    onClick={() => openEditLesson(lesson)}
                                    className="p-1.5 rounded text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Chỉnh sửa bài học"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingLesson({ id: lesson.id, title: lesson.title })}
                                    className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Xóa bài học"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {(!chapter.lessons || chapter.lessons.length === 0) && (
                            <p className="text-xs text-gray-400 py-1 pl-2">Chưa có bài học nào trong chương này</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!course.chapters || course.chapters.length === 0) && (
                      <p className="text-sm text-gray-400 text-center py-4">Chưa có chương nào. Nhấn "Thêm chương" để bắt đầu.</p>
                    )}
                  </div>
                </CardBody>
              )}
            </Card>
          ))}

          {/* Pagination */}
          {(coursesData?.totalPages ?? 1) > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Trước</Button>
              <span className="px-3 py-1.5 text-sm text-gray-500">Trang {page + 1} / {coursesData?.totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= (coursesData?.totalPages ?? 1) - 1} onClick={() => setPage(p => p + 1)}>Sau</Button>
            </div>
          )}
        </div>
      )}

      {/* Create Course Modal */}
      <Modal isOpen={showCreateCourse} onClose={() => setShowCreateCourse(false)} title="Tạo khóa học mới" size="lg">
        <div className="space-y-4">
          <Input label="Tên khóa học *" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Danh mục *" value={courseForm.categoryId} onChange={(e) => setCourseForm({ ...courseForm, categoryId: e.target.value })} options={categoryOptions} />
            <Select label="Cấp độ khóa học" value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} options={levelOptions} />
          </div>
          <FileUpload
            label="Ảnh bìa khóa học (Tùy chọn)"
            accept="image/*,.jpg,.jpeg,.png,.webp"
            folder="courses"
            currentFileUrl={courseForm.thumbnailUrl}
            onFileUploaded={(url) => setCourseForm({ ...courseForm, thumbnailUrl: url })}
            onFileRemoved={() => setCourseForm({ ...courseForm, thumbnailUrl: '' })}
          />
          <Textarea label="Mô tả khóa học" placeholder="Giới thiệu tổng quan về khóa học..." value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
          <Textarea label="Mục tiêu đầu ra" placeholder="Học viên sẽ đạt được kỹ năng gì sau khóa học..." value={courseForm.goal} onChange={(e) => setCourseForm({ ...courseForm, goal: e.target.value })} />
          <Textarea label="Yêu cầu tiên quyết" placeholder="Kiến thức hoặc công cụ học viên cần chuẩn bị trước..." value={courseForm.prerequisites} onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateCourse(false)}>Hủy</Button>
            <Button onClick={handleCreateCourse} isLoading={createCourseMutation.isPending} disabled={!courseForm.title || !courseForm.categoryId}>Tạo khóa học</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Course Modal */}
      <Modal isOpen={!!editingCourse} onClose={() => setEditingCourse(null)} title="Cập nhật khóa học" size="lg">
        <div className="space-y-4">
          <Input label="Tên khóa học *" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Danh mục *" value={courseForm.categoryId} onChange={(e) => setCourseForm({ ...courseForm, categoryId: e.target.value })} options={categoryOptions} />
            <Select label="Cấp độ khóa học" value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} options={levelOptions} />
          </div>
          <FileUpload
            label="Ảnh bìa khóa học (Tùy chọn)"
            accept="image/*,.jpg,.jpeg,.png,.webp"
            folder="courses"
            currentFileUrl={courseForm.thumbnailUrl}
            onFileUploaded={(url) => setCourseForm({ ...courseForm, thumbnailUrl: url })}
            onFileRemoved={() => setCourseForm({ ...courseForm, thumbnailUrl: '' })}
          />
          <Textarea label="Mô tả khóa học" placeholder="Giới thiệu tổng quan về khóa học..." value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
          <Textarea label="Mục tiêu đầu ra" placeholder="Học viên sẽ đạt được kỹ năng gì sau khóa học..." value={courseForm.goal} onChange={(e) => setCourseForm({ ...courseForm, goal: e.target.value })} />
          <Textarea label="Yêu cầu tiên quyết" placeholder="Kiến thức hoặc công cụ học viên cần chuẩn bị trước..." value={courseForm.prerequisites} onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditingCourse(null)}>Hủy</Button>
            <Button onClick={handleUpdateCourse} isLoading={updateCourseMutation.isPending}>Lưu thay đổi</Button>
          </div>
        </div>
      </Modal>

      {/* Publish Confirm */}
      <ConfirmDialog
        isOpen={!!publishingCourse}
        onClose={() => setPublishingCourse(null)}
        onConfirm={() => {
          if (publishingCourse) publishCourseMutation.mutate(publishingCourse.id, { onSuccess: () => setPublishingCourse(null) });
        }}
        title="Xuất bản khóa học"
        message={`Bạn có chắc muốn xuất bản khóa học "${publishingCourse?.title}"? Sau khi xuất bản sẽ không thể chuyển lại bản nháp.`}
        type="primary"
        confirmText="Xuất bản"
        isLoading={publishCourseMutation.isPending}
      />

      {/* Create Chapter Modal */}
      <Modal isOpen={!!showCreateChapter} onClose={() => setShowCreateChapter(null)} title="Thêm chương mới">
        <div className="space-y-4">
          <Input label="Tên chương" value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} required />
          <Input label="Thứ tự" type="number" value={chapterForm.orderNo} onChange={(e) => setChapterForm({ ...chapterForm, orderNo: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateChapter(null)}>Hủy</Button>
            <Button onClick={handleCreateChapter} isLoading={createChapterMutation.isPending}>Tạo</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Chapter Modal */}
      <Modal isOpen={!!editingChapter} onClose={() => setEditingChapter(null)} title="Cập nhật chương">
        <div className="space-y-4">
          <Input label="Tên chương" value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} required />
          <Input label="Thứ tự" type="number" value={chapterForm.orderNo} onChange={(e) => setChapterForm({ ...chapterForm, orderNo: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditingChapter(null)}>Hủy</Button>
            <Button onClick={handleUpdateChapter} isLoading={updateChapterMutation.isPending}>Lưu</Button>
          </div>
        </div>
      </Modal>

      {/* Create Lesson Modal */}
      <Modal
        isOpen={!!showCreateLesson}
        onClose={() => setShowCreateLesson(null)}
        title="Thêm bài học mới"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Tên bài học *"
            placeholder="Ví dụ: Giới thiệu kiến trúc hệ thống, Hướng dẫn cài đặt..."
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            required
          />

          {/* Chọn loại bài học */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hình thức bài học *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setLessonForm({ ...lessonForm, lessonType: 'TEXT' })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  lessonForm.lessonType === 'TEXT'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Văn bản</span>
              </button>

              <button
                type="button"
                onClick={() => setLessonForm({ ...lessonForm, lessonType: 'PDF' })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  lessonForm.lessonType === 'PDF'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-2 ring-red-500/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <FileCheck className="w-4 h-4 text-red-500" />
                <span>Tài liệu PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setLessonForm({ ...lessonForm, lessonType: 'VIDEO' })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  lessonForm.lessonType === 'VIDEO'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Video className="w-4 h-4 text-purple-500" />
                <span>Video bài giảng</span>
              </button>
            </div>
          </div>

          {/* Cấu hình Video khi chọn VIDEO */}
          {lessonForm.lessonType === 'VIDEO' && (
            <div className="space-y-3 p-3.5 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40">
              <Input
                label="Đường dẫn Video (YouTube, Vimeo hoặc link MP4) *"
                placeholder="Ví dụ: https://www.youtube.com/watch?v=... hoặc https://vimeo.com/..."
                value={lessonForm.videoUrl}
                onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <Input
                  label="Thời lượng ước tính (phút)"
                  type="number"
                  placeholder="Ví dụ: 15, 30..."
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                />
                <div className="text-xs text-gray-500 pb-2">
                  Hỗ trợ xem video trực tiếp từ YouTube, Vimeo và file MP4.
                </div>
              </div>
              <FileUpload
                label="Hoặc tải trực tiếp tệp video từ máy tính"
                accept="video/mp4,video/webm"
                folder="videos"
                currentFileUrl={lessonForm.videoUrl?.startsWith('/uploads/') ? lessonForm.videoUrl : ''}
                onFileUploaded={(url) => setLessonForm({ ...lessonForm, videoUrl: url })}
                onFileRemoved={() => setLessonForm({ ...lessonForm, videoUrl: '' })}
              />
            </div>
          )}

          {/* Upload PDF khi chọn PDF */}
          {lessonForm.lessonType === 'PDF' && (
            <FileUpload
              label="Tải lên tệp tài liệu PDF bài học *"
              currentFileUrl={lessonForm.fileUrl}
              currentFileName={lessonForm.fileName}
              onFileUploaded={(url, name) => setLessonForm({ ...lessonForm, fileUrl: url, fileName: name })}
              onFileRemoved={() => setLessonForm({ ...lessonForm, fileUrl: '', fileName: '' })}
            />
          )}

          <Textarea
            label={lessonForm.lessonType === 'TEXT' ? "Nội dung bài học *" : "Ghi chú / Hướng dẫn học tập (Tùy chọn)"}
            placeholder={lessonForm.lessonType === 'TEXT' ? "Nội dung chi tiết của bài học..." : "Mô tả ngắn gọn, tài liệu đọc thêm hoặc lưu ý cho học viên..."}
            rows={lessonForm.lessonType === 'TEXT' ? 5 : 3}
            value={lessonForm.content}
            onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
          />

          <Input
            label="Thứ tự hiển thị"
            type="number"
            value={lessonForm.orderNo}
            onChange={(e) => setLessonForm({ ...lessonForm, orderNo: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateLesson(null)}>Hủy</Button>
            <Button
              onClick={handleCreateLesson}
              isLoading={createLessonMutation.isPending}
              disabled={
                !lessonForm.title ||
                (lessonForm.lessonType === 'PDF' && !lessonForm.fileUrl) ||
                (lessonForm.lessonType === 'VIDEO' && !lessonForm.videoUrl)
              }
            >
              Tạo bài học
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal
        isOpen={!!editingLesson}
        onClose={() => setEditingLesson(null)}
        title="Cập nhật bài học"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Tên bài học *"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            required
          />

          {/* Chọn loại bài học */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hình thức bài học *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setLessonForm({ ...lessonForm, lessonType: 'TEXT' })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  lessonForm.lessonType === 'TEXT'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Văn bản</span>
              </button>

              <button
                type="button"
                onClick={() => setLessonForm({ ...lessonForm, lessonType: 'PDF' })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  lessonForm.lessonType === 'PDF'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-2 ring-red-500/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <FileCheck className="w-4 h-4 text-red-500" />
                <span>Tài liệu PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setLessonForm({ ...lessonForm, lessonType: 'VIDEO' })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  lessonForm.lessonType === 'VIDEO'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Video className="w-4 h-4 text-purple-500" />
                <span>Video bài giảng</span>
              </button>
            </div>
          </div>

          {/* Cấu hình Video khi chọn VIDEO */}
          {lessonForm.lessonType === 'VIDEO' && (
            <div className="space-y-3 p-3.5 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40">
              <Input
                label="Đường dẫn Video (YouTube, Vimeo hoặc link MP4) *"
                placeholder="Ví dụ: https://www.youtube.com/watch?v=... hoặc https://vimeo.com/..."
                value={lessonForm.videoUrl}
                onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <Input
                  label="Thời lượng ước tính (phút)"
                  type="number"
                  placeholder="Ví dụ: 15, 30..."
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                />
                <div className="text-xs text-gray-500 pb-2">
                  Hỗ trợ xem video trực tiếp từ YouTube, Vimeo và file MP4.
                </div>
              </div>
              <FileUpload
                label="Hoặc tải trực tiếp tệp video từ máy tính"
                accept="video/mp4,video/webm"
                folder="videos"
                currentFileUrl={lessonForm.videoUrl?.startsWith('/uploads/') ? lessonForm.videoUrl : ''}
                onFileUploaded={(url) => setLessonForm({ ...lessonForm, videoUrl: url })}
                onFileRemoved={() => setLessonForm({ ...lessonForm, videoUrl: '' })}
              />
            </div>
          )}

          {/* Upload PDF khi chọn PDF */}
          {lessonForm.lessonType === 'PDF' && (
            <FileUpload
              label="Tài liệu PDF bài học *"
              currentFileUrl={lessonForm.fileUrl}
              currentFileName={lessonForm.fileName}
              onFileUploaded={(url, name) => setLessonForm({ ...lessonForm, fileUrl: url, fileName: name })}
              onFileRemoved={() => setLessonForm({ ...lessonForm, fileUrl: '', fileName: '' })}
            />
          )}

          <Textarea
            label={lessonForm.lessonType === 'TEXT' ? "Nội dung bài học *" : "Ghi chú / Hướng dẫn học tập (Tùy chọn)"}
            placeholder={lessonForm.lessonType === 'TEXT' ? "Nội dung chi tiết của bài học..." : "Mô tả ngắn gọn, tài liệu đọc thêm hoặc lưu ý cho học viên..."}
            rows={lessonForm.lessonType === 'TEXT' ? 5 : 3}
            value={lessonForm.content}
            onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
          />

          <Input
            label="Thứ tự hiển thị"
            type="number"
            value={lessonForm.orderNo}
            onChange={(e) => setLessonForm({ ...lessonForm, orderNo: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditingLesson(null)}>Hủy</Button>
            <Button
              onClick={handleUpdateLesson}
              isLoading={updateLessonMutation.isPending}
              disabled={
                !lessonForm.title ||
                (lessonForm.lessonType === 'PDF' && !lessonForm.fileUrl) ||
                (lessonForm.lessonType === 'VIDEO' && !lessonForm.videoUrl)
              }
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Video Modal */}
      {previewVideo && (
        <Modal
          isOpen={!!previewVideo}
          onClose={() => setPreviewVideo(null)}
          title={`Xem trước Video: ${previewVideo.title}`}
          size="xl"
        >
          <div className="p-1">
            <VideoPlayer
              videoUrl={previewVideo.url}
              title={previewVideo.title}
              duration={previewVideo.duration}
              height="65vh"
            />
          </div>
        </Modal>
      )}

      {/* Preview PDF Modal */}
      {previewPdf && (
        <Modal
          isOpen={!!previewPdf}
          onClose={() => setPreviewPdf(null)}
          title={`Xem tài liệu: ${previewPdf.title}`}
          size="xl"
        >
          <div className="p-1">
            <PdfViewer
              fileUrl={previewPdf.url}
              fileName={previewPdf.fileName}
              title={previewPdf.title}
              height="70vh"
            />
          </div>
        </Modal>
      )}

      {/* Delete Lesson Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingLesson}
        onClose={() => setDeletingLesson(null)}
        onConfirm={() => {
          if (deletingLesson) {
            deleteLessonMutation.mutate(deletingLesson.id, {
              onSuccess: () => setDeletingLesson(null),
            });
          }
        }}
        title="Xóa bài học"
        message={`Bạn có chắc muốn xóa bài học "${deletingLesson?.title}"? Hành động này không thể hoàn tác.`}
        type="danger"
        confirmText="Xóa bài học"
        isLoading={deleteLessonMutation.isPending}
      />

      {/* Delete Course Confirm */}
      <ConfirmDialog
        isOpen={!!deletingCourse}
        onClose={() => setDeletingCourse(null)}
        onConfirm={() => {
          if (deletingCourse) {
            deleteCourseMutation.mutate(deletingCourse.id, {
              onSuccess: () => setDeletingCourse(null),
            });
          }
        }}
        title="Xóa khóa học"
        message={`Bạn có chắc chắn muốn xóa khóa học "${deletingCourse?.title}"? Lưu ý: Không thể xóa khóa học đã có lớp học liên kết.`}
        type="danger"
        confirmText="Xóa khóa học"
        isLoading={deleteCourseMutation.isPending}
      />

      {/* Delete Chapter Confirm */}
      <ConfirmDialog
        isOpen={!!deletingChapter}
        onClose={() => setDeletingChapter(null)}
        onConfirm={() => {
          if (deletingChapter) {
            deleteChapterMutation.mutate(deletingChapter.id, {
              onSuccess: () => setDeletingChapter(null),
            });
          }
        }}
        title="Xóa chương học"
        message={`Bạn có chắc chắn muốn xóa chương "${deletingChapter?.title}" cùng tất cả bài học trong chương? Hành động này không thể hoàn tác.`}
        type="danger"
        confirmText="Xóa chương"
        isLoading={deleteChapterMutation.isPending}
      />

      {/* Quiz Manager Modal */}
      {managingQuizLesson && (
        <QuizManagerModal
          isOpen={!!managingQuizLesson}
          onClose={() => setManagingQuizLesson(null)}
          lessonId={managingQuizLesson.id}
          lessonTitle={managingQuizLesson.title}
        />
      )}

      {/* Assignment Manager Modal */}
      {managingAssignmentLesson && (
        <AssignmentManagerModal
          isOpen={!!managingAssignmentLesson}
          onClose={() => setManagingAssignmentLesson(null)}
          lessonId={managingAssignmentLesson.id}
          lessonTitle={managingAssignmentLesson.title}
        />
      )}

      {/* Clone Course Modal */}
      {cloningCourse && (
        <Modal
          isOpen={!!cloningCourse}
          onClose={() => setCloningCourse(null)}
          title="Nhân bản khóa học (Tạo bản mẫu cho lớp mới)"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 rounded-xl text-sm text-indigo-900 dark:text-indigo-200">
              <p className="font-semibold flex items-center gap-1.5 mb-1 text-indigo-900 dark:text-indigo-200">
                <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Cơ chế nhân bản khóa học độc lập:
              </p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Hệ thống sẽ sao chép toàn bộ thông tin khóa học, các <strong>Chương</strong>, <strong>Bài học</strong> (Video/PDF/Text), <strong>Quiz trắc nghiệm</strong> và <strong>Bài tập nộp file</strong> sang một khóa học mới ở trạng thái <strong>Bản nháp (DRAFT)</strong>.
              </p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
                Bạn có thể tùy ý sửa đổi, thêm bớt nội dung trên bản sao này để xuất bản cho các lớp học khác mà <strong>hoàn toàn không ảnh hưởng</strong> đến khóa học gốc và các lớp đang chạy.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Khóa học gốc được sao chép
              </label>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                {cloningCourse.title}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên khóa học mới <span className="text-red-500">*</span>
              </label>
              <Input
                value={cloneTitle}
                onChange={(e) => setCloneTitle(e.target.value)}
                placeholder="Nhập tên khóa học mới..."
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCloningCourse(null)} disabled={cloneCourseMutation.isPending}>
                Hủy
              </Button>
              <Button
                onClick={handleConfirmClone}
                isLoading={cloneCourseMutation.isPending}
                disabled={!cloneTitle.trim()}
              >
                <Copy className="w-4 h-4 mr-1.5" />
                Xác nhận nhân bản
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
