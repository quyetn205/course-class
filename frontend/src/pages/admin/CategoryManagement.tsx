import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategoryHooks';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import type { CategoryResponse } from '../../types/course';
import { Plus, Edit, FolderOpen, Trash2 } from 'lucide-react';

export const CategoryManagement = () => {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
  };

  const handleCreate = () => {
    createMutation.mutate({ name: formName, description: formDescription || undefined }, {
      onSuccess: () => {
        setShowCreateModal(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!editingCategory) return;
    updateMutation.mutate({
      id: editingCategory.id,
      data: { name: formName, description: formDescription || undefined },
    }, {
      onSuccess: () => {
        setEditingCategory(null);
        resetForm();
      },
    });
  };

  const openEdit = (cat: CategoryResponse) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description || '');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý danh mục</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý danh mục khóa học trong hệ thống</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateModal(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
        </Button>
      </div>

      {!categories || categories.length === 0 ? (
        <EmptyState
          title="Chưa có danh mục nào"
          description="Tạo danh mục đầu tiên để phân loại các khóa học."
          action={<Button onClick={() => { resetForm(); setShowCreateModal(true); }}><Plus className="w-4 h-4 mr-2" /> Thêm danh mục</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {cat.description || 'Không có mô tả'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 transition-colors"
                      title="Sửa danh mục"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors"
                      title="Xóa danh mục"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Thêm danh mục mới">
        <div className="space-y-4">
          <Input label="Tên danh mục" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ví dụ: Lập trình Web" required />
          <Textarea label="Mô tả" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Mô tả ngắn về danh mục" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Hủy</Button>
            <Button onClick={handleCreate} isLoading={createMutation.isPending} disabled={!formName}>Tạo</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingCategory} onClose={() => setEditingCategory(null)} title="Cập nhật danh mục">
        <div className="space-y-4">
          <Input label="Tên danh mục" value={formName} onChange={(e) => setFormName(e.target.value)} required />
          <Textarea label="Mô tả" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditingCategory(null)}>Hủy</Button>
            <Button onClick={handleUpdate} isLoading={updateMutation.isPending} disabled={!formName}>Lưu</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => {
          if (!deletingCategory) return;
          deleteMutation.mutate(deletingCategory.id, {
            onSuccess: () => setDeletingCategory(null),
          });
        }}
        title="Xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${deletingCategory?.name}"? Hệ thống sẽ ngăn chặn việc xóa nếu danh mục đang chứa khóa học.`}
        confirmText="Xóa danh mục"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
