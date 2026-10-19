import { useState } from 'react';
import {
  useClassrooms, useCreateClassroom, useUpdateClassroom, useUpdateClassroomStatus,
  useDeleteClassroom, useClassroomStudents, useAddStudent, useRemoveStudent
} from '../../hooks/useClassroomHooks';
import { useCourses } from '../../hooks/useCourseHooks';
import { useUsers } from '../../hooks/useUserHooks';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ClassGradebookView } from '../../components/instructor/ClassGradebookView';
import type { ClassroomResponse, ClassroomStatus, EnrollmentResponse } from '../../types/classroom';
import {
  Plus, Users, GraduationCap, UserPlus, Trash2, Edit, Calendar, BookOpen,
  Search, ArrowLeft, PlayCircle, CheckCircle2, XCircle, FileSpreadsheet
} from 'lucide-react';

export const ClassManagement = () => {
  // Query state
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourseId, setFilterCourseId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Classroom queries
  const { data: classroomsData, isLoading: loadingClasses } = useClassrooms({
    courseId: filterCourseId ? Number(filterCourseId) : undefined,
    status: (filterStatus || undefined) as ClassroomStatus | undefined,
    search: searchTerm || undefined,
    page,
    size: 9,
  });

  const { data: coursesData, isLoading: loadingCourses } = useCourses({ status: 'PUBLISHED', page: 0, size: 100 });
  const { data: studentsData } = useUsers({ role: 'STUDENT', page: 0, size: 100 });

  // Detail / Manage students state
  const [selectedClass, setSelectedClass] = useState<ClassroomResponse | null>(null);
  const [classDetailTab, setClassDetailTab] = useState<'STUDENTS' | 'GRADEBOOK'>('STUDENTS');
  const [studentPage, setStudentPage] = useState(0);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassroomResponse | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassroomResponse | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [removingStudent, setRemovingStudent] = useState<{ classId: number; studentId: number; name: string } | null>(null);
  const [addStudentId, setAddStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // Forms state
  const [classForm, setClassForm] = useState({
    courseId: '',
    name: '',
    startDate: '',
    endDate: '',
    maxStudents: '30'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    maxStudents: '30',
    status: 'OPEN' as ClassroomStatus
  });

  // Mutations
  const createMutation = useCreateClassroom();
  const updateMutation = useUpdateClassroom();
  const statusMutation = useUpdateClassroomStatus();
  const deleteMutation = useDeleteClassroom();
  const addStudentMutation = useAddStudent();
  const removeStudentMutation = useRemoveStudent();

  // Enrolled students in selected class
  const { data: enrollmentsData, isLoading: loadingStudents } = useClassroomStudents(
    selectedClass?.id ?? 0,
    { page: studentPage, size: 10 }
  );

  const publishedCourses = (coursesData?.content ?? []).filter(c => c.status === 'PUBLISHED');
  const courseOptions = publishedCourses.map(c => ({ value: c.id, label: c.title }));
  const filterCourseOptions = [
    { value: '', label: 'Tất cả khóa học' },
    ...courseOptions
  ];
  const statusFilterOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'OPEN', label: 'Mở (OPEN)' },
    { value: 'IN_PROGRESS', label: 'Đang học (IN_PROGRESS)' },
    { value: 'CLOSED', label: 'Đã đóng (CLOSED)' },
  ];

  // Lọc danh sách học viên chưa ghi danh vào lớp được chọn và khớp từ khóa tìm kiếm
  const enrolledStudentIds = new Set((enrollmentsData?.content ?? []).map(e => e.studentId));
  const availableStudents = (studentsData?.content ?? []).filter(s => {
    if (enrolledStudentIds.has(s.id)) return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    }
    return true;
  });
  const studentOptions = availableStudents.map(s => ({
    value: s.id,
    label: `${s.name} (${s.email})`
  }));

  // Handlers
  const handleCreate = () => {
    createMutation.mutate({
      courseId: Number(classForm.courseId),
      name: classForm.name,
      startDate: classForm.startDate || undefined,
      endDate: classForm.endDate || undefined,
      maxStudents: classForm.maxStudents ? Number(classForm.maxStudents) : undefined,
    }, {
      onSuccess: () => {
        setShowCreateModal(false);
        setClassForm({ courseId: '', name: '', startDate: '', endDate: '', maxStudents: '30' });
      },
    });
  };

  const handleOpenEdit = (cls: ClassroomResponse) => {
    setEditingClass(cls);
    setEditForm({
      name: cls.name,
      startDate: cls.startDate || '',
      endDate: cls.endDate || '',
      maxStudents: String(cls.maxStudents),
      status: cls.status,
    });
  };

  const handleUpdate = () => {
    if (!editingClass) return;
    updateMutation.mutate({
      id: editingClass.id,
      data: {
        name: editForm.name,
        startDate: editForm.startDate || undefined,
        endDate: editForm.endDate || undefined,
        maxStudents: editForm.maxStudents ? Number(editForm.maxStudents) : undefined,
        status: editForm.status,
      }
    }, {
      onSuccess: () => {
        setEditingClass(null);
        if (selectedClass && selectedClass.id === editingClass.id) {
          setSelectedClass({
            ...selectedClass,
            name: editForm.name,
            startDate: editForm.startDate || null,
            endDate: editForm.endDate || null,
            maxStudents: Number(editForm.maxStudents),
            status: editForm.status,
          });
        }
      }
    });
  };

  const handleToggleStatus = (cls: ClassroomResponse, nextStatus: ClassroomStatus) => {
    statusMutation.mutate({ id: cls.id, status: nextStatus }, {
      onSuccess: () => {
        if (selectedClass && selectedClass.id === cls.id) {
          setSelectedClass({ ...selectedClass, status: nextStatus });
        }
      }
    });
  };

  const handleDeleteClass = () => {
    if (!deletingClass) return;
    deleteMutation.mutate(deletingClass.id, {
      onSuccess: () => {
        setDeletingClass(null);
        if (selectedClass && selectedClass.id === deletingClass.id) {
          setSelectedClass(null);
        }
      }
    });
  };

  const handleAddStudent = () => {
    if (!selectedClass || !addStudentId) return;
    addStudentMutation.mutate({
      classId: selectedClass.id,
      data: { studentId: Number(addStudentId) },
    }, {
      onSuccess: () => {
        setShowAddStudent(false);
        setAddStudentId('');
        // Update local count in selectedClass
        setSelectedClass({
          ...selectedClass,
          currentStudents: selectedClass.currentStudents + 1
        });
      },
    });
  };

  const handleRemoveStudent = () => {
    if (!removingStudent || !selectedClass) return;
    removeStudentMutation.mutate({
      classId: removingStudent.classId,
      studentId: removingStudent.studentId,
    }, {
      onSuccess: () => {
        setRemovingStudent(null);
        setSelectedClass({
          ...selectedClass,
          currentStudents: Math.max(0, selectedClass.currentStudents - 1)
        });
      },
    });
  };

  const enrollmentColumns: Column<EnrollmentResponse>[] = [
    { key: 'studentName', header: 'Họ và tên' },
    { key: 'studentEmail', header: 'Email học viên' },
    {
      key: 'enrolledDate',
      header: 'Ngày ghi danh',
      render: (row) => new Date(row.enrolledDate).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <button
          onClick={() => setRemovingStudent({ classId: selectedClass!.id, studentId: row.studentId, name: row.studentName })}
          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Xóa khỏi lớp học"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (loadingCourses) return <LoadingSpinner />;

  const classrooms = classroomsData?.content ?? [];
  const totalClasses = classroomsData?.totalElements ?? 0;
  const totalPages = classroomsData?.totalPages ?? 1;

  // View: Manage Students in Selected Class
  if (selectedClass) {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => setSelectedClass(null)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp học
          </button>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardBody>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedClass.name}</h2>
                      <Badge variant={selectedClass.status === 'OPEN' ? 'success' : selectedClass.status === 'IN_PROGRESS' ? 'primary' : 'default'}>
                        {selectedClass.status === 'OPEN' ? 'Mở' : selectedClass.status === 'IN_PROGRESS' ? 'Đang học' : 'Đã đóng'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary-500" /> Khóa học: <span className="font-medium text-gray-800 dark:text-gray-200">{selectedClass.courseName}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" /> Sĩ số: <strong>{selectedClass.currentStudents}/{selectedClass.maxStudents}</strong>
                      </span>
                      {selectedClass.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(selectedClass.startDate).toLocaleDateString('vi-VN')}
                          {selectedClass.endDate ? ` → ${new Date(selectedClass.endDate).toLocaleDateString('vi-VN')}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(selectedClass)}>
                    <Edit className="w-4 h-4 mr-1.5" /> Sửa thông tin lớp
                  </Button>
                  <Button size="sm" onClick={() => setShowAddStudent(true)} disabled={selectedClass.currentStudents >= selectedClass.maxStudents}>
                    <UserPlus className="w-4 h-4 mr-1.5" /> Thêm học viên
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          <button
            type="button"
            onClick={() => setClassDetailTab('STUDENTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              classDetailTab === 'STUDENTS'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Danh sách học viên ({selectedClass.currentStudents})
          </button>
          <button
            type="button"
            onClick={() => setClassDetailTab('GRADEBOOK')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              classDetailTab === 'GRADEBOOK'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Sổ điểm & Tiến độ lớp (Gradebook)
          </button>
        </div>

        {classDetailTab === 'STUDENTS' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" /> Danh sách học viên ({selectedClass.currentStudents})
              </h3>
            </div>

            <DataTable
              columns={enrollmentColumns}
              data={enrollmentsData?.content ?? []}
              loading={loadingStudents}
              page={studentPage}
              totalPages={enrollmentsData?.totalPages ?? 1}
              onPageChange={setStudentPage}
              emptyMessage="Chưa có học viên nào trong lớp này. Hãy bấm 'Thêm học viên' để ghi danh."
            />
          </div>
        ) : (
          <ClassGradebookView classId={selectedClass.id} />
        )}

        {/* Modal: Add Student */}
        <Modal
          isOpen={showAddStudent}
          onClose={() => { setShowAddStudent(false); setStudentSearch(''); setAddStudentId(''); }}
          title="Thêm học viên vào lớp"
        >
          <div className="space-y-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-950/30 border border-primary-200/60 dark:border-primary-800/40 rounded-xl text-xs text-primary-800 dark:text-primary-200 flex items-center justify-between">
              <span>Sĩ số lớp: <strong>{selectedClass.currentStudents} / {selectedClass.maxStudents}</strong></span>
              <span className="text-gray-500 dark:text-gray-400">Còn {Math.max(0, selectedClass.maxStudents - selectedClass.currentStudents)} chỗ trống</span>
            </div>

            {selectedClass.currentStudents >= selectedClass.maxStudents ? (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200">
                Lớp học đã đạt sĩ số tối đa ({selectedClass.maxStudents} học viên). Vui lòng sửa thông tin lớp để tăng sĩ số tối đa trước khi thêm học viên mới.
              </div>
            ) : (
              <>
                <Input
                  label="Tìm kiếm nhanh học viên"
                  placeholder="Gõ tên hoặc email học viên..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />

                {availableStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    {studentSearch ? 'Không tìm thấy học viên nào phù hợp với từ khóa.' : 'Tất cả học viên trong hệ thống đã được ghi danh vào lớp học này.'}
                  </div>
                ) : (
                  <Select
                    label={`Chọn học viên cần thêm (${availableStudents.length} học viên khả dụng)`}
                    value={addStudentId}
                    onChange={(e) => setAddStudentId(e.target.value)}
                    options={studentOptions}
                  />
                )}
              </>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" onClick={() => { setShowAddStudent(false); setStudentSearch(''); setAddStudentId(''); }}>
                Hủy
              </Button>
              <Button
                onClick={handleAddStudent}
                isLoading={addStudentMutation.isPending}
                disabled={!addStudentId || selectedClass.currentStudents >= selectedClass.maxStudents}
              >
                Ghi danh học viên
              </Button>
            </div>
          </div>
        </Modal>

        {/* Confirm: Remove Student */}
        <ConfirmDialog
          isOpen={!!removingStudent}
          onClose={() => setRemovingStudent(null)}
          onConfirm={handleRemoveStudent}
          title="Xóa học viên khỏi lớp"
          message={`Bạn có chắc muốn xóa học viên "${removingStudent?.name}" khỏi lớp học này?`}
          type="danger"
          confirmText="Xác nhận xóa"
          isLoading={removeStudentMutation.isPending}
        />

        {/* Edit Modal reuse */}
        <Modal isOpen={!!editingClass} onClose={() => setEditingClass(null)} title="Chỉnh sửa thông tin lớp học">
          <div className="space-y-4">
            <Input
              label="Tên lớp học"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ngày bắt đầu"
                type="date"
                value={editForm.startDate}
                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
              />
              <Input
                label="Ngày kết thúc"
                type="date"
                value={editForm.endDate}
                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
              />
            </div>
            <Input
              label="Sĩ số tối đa"
              type="number"
              value={editForm.maxStudents}
              onChange={(e) => setEditForm({ ...editForm, maxStudents: e.target.value })}
            />
            <Select
              label="Trạng thái lớp học"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ClassroomStatus })}
              options={[
                { value: 'OPEN', label: 'Mở ghi danh (OPEN)' },
                { value: 'IN_PROGRESS', label: 'Đang diễn ra (IN_PROGRESS)' },
                { value: 'CLOSED', label: 'Đã kết thúc / Đóng (CLOSED)' },
              ]}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setEditingClass(null)}>Hủy</Button>
              <Button onClick={handleUpdate} isLoading={updateMutation.isPending}>Lưu thay đổi</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // View: Main Classrooms List
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý lớp học</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Mở lớp học từ các khóa đã xuất bản, theo dõi sĩ số và ghi danh học viên
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={publishedCourses.length === 0}
          title={publishedCourses.length === 0 ? 'Bạn cần có ít nhất 1 khóa học PUBLISHED để tạo lớp' : ''}
        >
          <Plus className="w-4 h-4 mr-2" /> Tạo lớp học mới
        </Button>
      </div>

      {publishedCourses.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
          ⚠️ <strong>Chú ý:</strong> Bạn chưa có khóa học nào ở trạng thái <strong>PUBLISHED</strong>. Hãy vào mục <em>Quản lý khóa học</em> và bấm <em>Xuất bản</em> khóa học trước khi tạo lớp học.
        </div>
      )}

      {/* Filters bar */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardBody className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên lớp..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Select
              value={filterCourseId}
              onChange={(e) => { setFilterCourseId(e.target.value); setPage(0); }}
              options={filterCourseOptions}
            />
            <Select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
              options={statusFilterOptions}
            />
          </div>
        </CardBody>
      </Card>

      {/* Classrooms Grid */}
      {loadingClasses ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : classrooms.length === 0 ? (
        <EmptyState
          title={searchTerm || filterCourseId || filterStatus ? 'Không tìm thấy lớp học phù hợp' : 'Chưa có lớp học nào'}
          description={
            searchTerm || filterCourseId || filterStatus
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.'
              : 'Tạo lớp học mới từ các khóa học đã xuất bản, sau đó thêm học viên vào lớp.'
          }
          icon={<GraduationCap className="w-12 h-12 text-gray-400" />}
          action={
            publishedCourses.length > 0 ? (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Tạo lớp học đầu tiên
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classrooms.map((cls) => {
              const capacityPercent = cls.maxStudents > 0
                ? Math.min(100, Math.round((cls.currentStudents / cls.maxStudents) * 100))
                : 0;

              return (
                <Card
                  key={cls.id}
                  className="border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <CardBody className="p-5 flex flex-col justify-between h-full">
                    <div>
                      {/* Top status & actions */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <Badge variant={cls.status === 'OPEN' ? 'success' : cls.status === 'IN_PROGRESS' ? 'primary' : 'default'}>
                          {cls.status === 'OPEN' ? 'Mở ghi danh' : cls.status === 'IN_PROGRESS' ? 'Đang học' : 'Đã đóng'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(cls)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Sửa thông tin lớp"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingClass(cls)}
                            disabled={cls.currentStudents > 0}
                            className={`p-1.5 rounded-md transition-colors ${
                              cls.currentStudents > 0
                                ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title={cls.currentStudents > 0 ? 'Không thể xóa lớp đã có học viên' : 'Xóa lớp học'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Class Title & Course */}
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1 mb-1">
                        {cls.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 line-clamp-1 mb-4">
                        <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-primary-500" />
                        <span className="truncate">{cls.courseName}</span>
                      </p>

                      {/* Dates */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4 bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-gray-400">
                            <Calendar className="w-3.5 h-3.5" /> Bắt đầu:
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {cls.startDate ? new Date(cls.startDate).toLocaleDateString('vi-VN') : 'Chưa xếp'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-gray-400">
                            <Calendar className="w-3.5 h-3.5" /> Kết thúc:
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {cls.endDate ? new Date(cls.endDate).toLocaleDateString('vi-VN') : 'Chưa xếp'}
                          </span>
                        </div>
                      </div>

                      {/* Capacity progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Sĩ số học viên:
                          </span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {cls.currentStudents} / {cls.maxStudents} ({capacityPercent}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              capacityPercent >= 100
                                ? 'bg-red-500'
                                : capacityPercent >= 80
                                ? 'bg-amber-500'
                                : 'bg-primary-600'
                            }`}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setSelectedClass(cls)}
                      >
                        <Users className="w-4 h-4 mr-1.5" /> Quản lý học viên ({cls.currentStudents})
                      </Button>

                      {/* Quick Status toggle */}
                      {cls.status === 'OPEN' ? (
                        <button
                          onClick={() => handleToggleStatus(cls, 'IN_PROGRESS')}
                          title="Bắt đầu học (Chuyển sang IN_PROGRESS)"
                          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-xs font-medium"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      ) : cls.status === 'IN_PROGRESS' ? (
                        <button
                          onClick={() => handleToggleStatus(cls, 'CLOSED')}
                          title="Kết thúc lớp (Chuyển sang CLOSED)"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(cls, 'OPEN')}
                          title="Mở lại lớp (Chuyển sang OPEN)"
                          className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-xs font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400 px-3">
                Trang {page + 1} / {totalPages} (Tổng {totalClasses} lớp)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Class */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tạo lớp học mới" size="lg">
        <div className="space-y-4">
          <Select
            label="Khóa học áp dụng (bắt buộc)"
            value={classForm.courseId}
            onChange={(e) => setClassForm({ ...classForm, courseId: e.target.value })}
            options={courseOptions}
            required
          />
          <Input
            label="Tên lớp học"
            value={classForm.name}
            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
            placeholder="Ví dụ: Java Web - Lớp K24-A"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={classForm.startDate}
              onChange={(e) => setClassForm({ ...classForm, startDate: e.target.value })}
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={classForm.endDate}
              onChange={(e) => setClassForm({ ...classForm, endDate: e.target.value })}
            />
          </div>
          <Input
            label="Sĩ số tối đa"
            type="number"
            value={classForm.maxStudents}
            onChange={(e) => setClassForm({ ...classForm, maxStudents: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Hủy</Button>
            <Button
              onClick={handleCreate}
              isLoading={createMutation.isPending}
              disabled={!classForm.courseId || !classForm.name.trim()}
            >
              Tạo lớp học
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Edit Class */}
      <Modal isOpen={!!editingClass} onClose={() => setEditingClass(null)} title="Chỉnh sửa thông tin lớp học">
        <div className="space-y-4">
          <Input
            label="Tên lớp học"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={editForm.startDate}
              onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={editForm.endDate}
              onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
            />
          </div>
          <Input
            label="Sĩ số tối đa"
            type="number"
            value={editForm.maxStudents}
            onChange={(e) => setEditForm({ ...editForm, maxStudents: e.target.value })}
          />
          <Select
            label="Trạng thái lớp học"
            value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ClassroomStatus })}
            options={[
              { value: 'OPEN', label: 'Mở ghi danh (OPEN)' },
              { value: 'IN_PROGRESS', label: 'Đang diễn ra (IN_PROGRESS)' },
              { value: 'CLOSED', label: 'Đã kết thúc / Đóng (CLOSED)' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditingClass(null)}>Hủy</Button>
            <Button onClick={handleUpdate} isLoading={updateMutation.isPending}>Lưu thay đổi</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm: Delete Class */}
      <ConfirmDialog
        isOpen={!!deletingClass}
        onClose={() => setDeletingClass(null)}
        onConfirm={handleDeleteClass}
        title="Xóa lớp học"
        message={`Bạn có chắc muốn xóa lớp học "${deletingClass?.name}"? Hành động này không thể hoàn tác.`}
        type="danger"
        confirmText="Xác nhận xóa"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
