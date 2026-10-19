import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useUpdateUserStatus, useResetPassword } from '../../hooks/useUserHooks';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { UserResponse, UserRole, UserStatus } from '../../types/user';
import { Plus, Edit, Lock, Unlock, KeyRound, Search } from 'lucide-react';

export const UserManagement = () => {
  const [page, setPage] = useState(0);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [statusUser, setStatusUser] = useState<UserResponse | null>(null);
  const [resetUser, setResetUser] = useState<UserResponse | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('123456');

  const { data, isLoading } = useUsers({
    role: filterRole || undefined,
    status: filterStatus || undefined,
    keyword: searchKeyword.trim() || undefined,
    page,
    size: 10,
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const statusMutation = useUpdateUserStatus();
  const resetMutation = useResetPassword();

  // Create form state
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' as UserRole });
  // Edit form state
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    createMutation.mutate(createForm, {
      onSuccess: () => {
        setShowCreateModal(false);
        setCreateForm({ name: '', email: '', password: '', role: 'STUDENT' });
      },
    });
  };

  const handleUpdate = () => {
    if (!editingUser) return;
    updateMutation.mutate({ id: editingUser.id, data: { name: editName } }, {
      onSuccess: () => setEditingUser(null),
    });
  };

  const handleToggleStatus = () => {
    if (!statusUser) return;
    const newStatus: UserStatus = statusUser.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    statusMutation.mutate({ id: statusUser.id, data: { status: newStatus } }, {
      onSuccess: () => setStatusUser(null),
    });
  };

  const columns: Column<UserResponse>[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Họ tên' },
    { key: 'email', header: 'Email' },
    {
      key: 'role', header: 'Vai trò',
      render: (row) => (
        <Badge variant={row.role === 'ADMIN' ? 'danger' : row.role === 'INSTRUCTOR' ? 'primary' : 'default'}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: 'status', header: 'Trạng thái',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'}>
          {row.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
        </Badge>
      ),
    },
    {
      key: 'actions', header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditingUser(row); setEditName(row.name); }}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600"
            title="Sửa họ tên"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setResetUser(row); setResetPasswordVal('123456'); }}
            className="p-1.5 rounded-md text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600"
            title="Đặt lại mật khẩu"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={() => setStatusUser(row)}
            className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
              row.status === 'ACTIVE' ? 'text-danger hover:text-danger' : 'text-success hover:text-success'
            }`}
            title={row.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
          >
            {row.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý tài khoản</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý tất cả tài khoản trong hệ thống</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Tạo tài khoản
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm kiếm theo họ tên hoặc email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
          >
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="STUDENT">Student</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Bị khóa</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tạo tài khoản mới">
        <div className="space-y-4">
          <Input label="Họ tên" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
          <Input label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
          <Input label="Mật khẩu" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required />
          <Select
            label="Vai trò"
            value={createForm.role}
            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
            options={[
              { value: 'STUDENT', label: 'Student' },
              { value: 'INSTRUCTOR', label: 'Instructor' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Hủy</Button>
            <Button onClick={handleCreate} isLoading={createMutation.isPending}>Tạo</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Cập nhật tài khoản">
        <div className="space-y-4">
          <Input label="Họ tên" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditingUser(null)}>Hủy</Button>
            <Button onClick={handleUpdate} isLoading={updateMutation.isPending}>Lưu</Button>
          </div>
        </div>
      </Modal>

      {/* Status Confirm */}
      <ConfirmDialog
        isOpen={!!statusUser}
        onClose={() => setStatusUser(null)}
        onConfirm={handleToggleStatus}
        title={statusUser?.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        message={`Bạn có chắc muốn ${statusUser?.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản "${statusUser?.name}"?`}
        type={statusUser?.status === 'ACTIVE' ? 'danger' : 'primary'}
        confirmText={statusUser?.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
        isLoading={statusMutation.isPending}
      />

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetUser}
        onClose={() => setResetUser(null)}
        title="Đặt lại mật khẩu cho tài khoản"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Bạn đang chuẩn bị đặt lại mật khẩu cho: <strong className="text-primary-600">{resetUser?.name}</strong> ({resetUser?.email})
          </p>
          <Input
            label="Mật khẩu mới (để trống sẽ tự động lấy mặc định: 123456)"
            type="text"
            value={resetPasswordVal}
            onChange={(e) => setResetPasswordVal(e.target.value)}
            placeholder="Nhập mật khẩu mới"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setResetUser(null)}>
              Hủy
            </Button>
            <Button
              isLoading={resetMutation.isPending}
              onClick={() => {
                if (!resetUser) return;
                resetMutation.mutate(
                  { id: resetUser.id, data: { newPassword: resetPasswordVal.trim() || '123456' } },
                  { onSuccess: () => setResetUser(null) }
                );
              }}
            >
              Xác nhận đặt lại
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
