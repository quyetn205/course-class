import React, { useState } from 'react';
import { FileText, Download, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface PdfViewerProps {
  fileUrl: string;
  fileName?: string;
  title?: string;
  height?: string;
  showToolbar?: boolean;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  fileUrl,
  fileName = 'Tai_lieu.pdf',
  title,
  height = '650px',
  showToolbar = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getFullUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Dùng đường dẫn tương đối để đi qua Vite proxy (cùng origin với frontend, không bị chặn frame)
    return url;
  };

  const fullUrl = getFullUrl(fileUrl);
  const directBackendUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:8080${fileUrl}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = directBackendUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen border-none' : ''
      }`}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-lg shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {title || fileName}
              </h3>
              {title && fileName && (
                <p className="text-xs text-gray-500 truncate">{fileName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              title="Tải file PDF về máy"
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải về</span>
            </Button>

            <a
              href={directBackendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Mở tài liệu trong tab mới"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tab mới</span>
            </a>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              className="p-1.5"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* PDF View Container */}
      <div
        className="w-full relative bg-gray-100 dark:bg-gray-950 flex-1"
        style={{ height: isFullscreen ? 'calc(100vh - 57px)' : height }}
      >
        <object
          data={`${fullUrl}#toolbar=1&navpanes=0`}
          type="application/pdf"
          className="w-full h-full border-0 block"
        >
          <iframe
            src={`${fullUrl}#toolbar=1&navpanes=0`}
            title={title || fileName}
            className="w-full h-full border-0"
          >
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 dark:bg-gray-900">
              <FileText className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Không thể tải trực tiếp tài liệu trong khung xem này
              </p>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Bạn có thể mở tài liệu trong tab mới hoặc tải về máy để xem.
              </p>
              <div className="flex items-center gap-3">
                <Button onClick={handleDownload} size="sm">Tải về máy</Button>
                <a
                  href={directBackendUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:underline"
                >
                  Mở tab mới
                </a>
              </div>
            </div>
          </iframe>
        </object>
      </div>
    </div>
  );
};
