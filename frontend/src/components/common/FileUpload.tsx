import React, { useState, useRef } from 'react';
import { fileApi } from '../../api/fileApi';
import { UploadCloud, FileText, CheckCircle, X, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  folder?: string;
  currentFileUrl?: string | null;
  currentFileName?: string | null;
  onFileUploaded: (fileUrl: string, fileName: string) => void;
  onFileRemoved?: () => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Tải lên tài liệu PDF',
  accept = '.pdf,application/pdf',
  maxSizeMB = 50,
  folder = 'lessons',
  currentFileUrl,
  currentFileName,
  onFileUploaded,
  onFileRemoved,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFullUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8080${url}`;
  };

  const isImageFile = (url?: string | null, name?: string | null) => {
    const target = (name || url || '').toLowerCase();
    return target.endsWith('.png') || target.endsWith('.jpg') || target.endsWith('.jpeg') || target.endsWith('.webp');
  };

  const handleFileChange = async (file: File) => {
    // Validate định dạng PDF nếu yêu cầu
    if (accept.includes('.pdf') && !file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      toast.error('Vui lòng chọn file định dạng PDF (.pdf)');
      return;
    }

    // Validate ảnh nếu yêu cầu ảnh
    if (accept.includes('image') && !file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file định dạng hình ảnh (.png, .jpg, .webp)');
      return;
    }

    // Validate dung lượng
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Kích thước file vượt quá giới hạn cho phép (${maxSizeMB}MB)`);
      return;
    }

    try {
      setIsUploading(true);
      const res = await fileApi.uploadFile(file, folder);
      toast.success(`Tải lên "${res.fileName}" thành công!`);
      onFileUploaded(res.fileUrl, res.fileName);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Tải file lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const isCurrentAnImage = isImageFile(currentFileUrl, currentFileName);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Hiển thị file đã upload */}
      {currentFileUrl ? (
        <div className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${
          isCurrentAnImage
            ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
            : 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            {isCurrentAnImage ? (
              <img
                src={getFullUrl(currentFileUrl)}
                alt="Thumbnail preview"
                className="w-12 h-12 object-cover rounded-lg border border-blue-200 dark:border-blue-800 shrink-0"
              />
            ) : (
              <div className="p-2.5 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-lg shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {currentFileName || (isCurrentAnImage ? 'Ảnh bìa đã tải lên' : 'Tài liệu đã tải lên')}
                </p>
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isCurrentAnImage ? 'Đã áp dụng ảnh bìa' : 'Đã sẵn sàng cho học viên'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <a
              href={getFullUrl(currentFileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors title='Mở tài liệu'"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            {!disabled && onFileRemoved && (
              <button
                type="button"
                onClick={onFileRemoved}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors title='Xóa file'"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Vùng kéo thả upload */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 scale-[0.99]'
              : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
          } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center">
            {isUploading ? (
              <div className="py-2 flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đang tải file lên máy chủ...
                </p>
                <p className="text-xs text-gray-400 mt-1">Vui lòng chờ trong giây lát</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Nhấn để chọn file PDF hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Định dạng hỗ trợ: PDF (tối đa {maxSizeMB}MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
