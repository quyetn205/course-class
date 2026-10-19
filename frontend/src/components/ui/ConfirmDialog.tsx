// No imports needed
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger',
  isLoading = false,
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-full mb-4 ${
          type === 'danger' ? 'bg-danger/10 text-danger' : 
          type === 'warning' ? 'bg-warning/10 text-warning' : 
          'bg-primary-100 text-primary-600'
        }`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex items-center justify-end w-full gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1">
            {cancelText}
          </Button>
          <Button 
            variant={type === 'primary' ? 'primary' : 'danger'} 
            onClick={onConfirm} 
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
