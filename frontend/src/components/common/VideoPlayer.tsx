import React, { useState } from 'react';
import { PlayCircle, ExternalLink, Maximize2, Minimize2, Video } from 'lucide-react';
import { Button } from '../ui/Button';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  duration?: number | null;
  height?: string;
  showToolbar?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  duration,
  height = '480px',
  showToolbar = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Phân tích loại video
  const getEmbedInfo = (url: string) => {
    if (!url) return { type: 'unknown', src: '' };

    // YouTube: https://www.youtube.com/watch?v=VIDEO_ID hoặc https://youtu.be/VIDEO_ID
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      return {
        type: 'youtube',
        src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`,
      };
    }

    // Vimeo: https://vimeo.com/VIDEO_ID
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return {
        type: 'vimeo',
        src: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      };
    }

    // Direct MP4 / WebM
    const isDirect = url.endsWith('.mp4') || url.endsWith('.webm') || url.startsWith('/uploads/');
    const directUrl = url.startsWith('http') ? url : url;

    return {
      type: isDirect ? 'direct' : 'iframe',
      src: directUrl,
    };
  };

  const { type, src } = getEmbedInfo(videoUrl);

  return (
    <div
      className={`flex flex-col bg-gray-950 rounded-2xl border border-gray-800 shadow-lg overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen border-none' : ''
      }`}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-purple-950/80 text-purple-400 rounded-lg shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {title || 'Video bài giảng'}
              </h3>
              {duration ? (
                <p className="text-xs text-gray-400">Thời lượng: ~{duration} phút</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title="Mở link gốc"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mở ngoài</span>
            </a>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              className="p-1.5 text-gray-300 hover:text-white"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Video Content */}
      <div
        className="w-full relative bg-black flex items-center justify-center flex-1"
        style={{ height: isFullscreen ? 'calc(100vh - 57px)' : height }}
      >
        {type === 'direct' ? (
          <video
            src={src}
            controls
            className="w-full h-full object-contain"
            controlsList="nodownload"
          >
            Trình duyệt của bạn không hỗ trợ phát video này.
          </video>
        ) : type === 'youtube' || type === 'vimeo' || type === 'iframe' ? (
          <iframe
            src={src}
            title={title || 'Video player'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="text-center p-8 text-gray-400">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Đường dẫn video không hợp lệ hoặc chưa được hỗ trợ.</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-primary-400 hover:underline"
            >
              Nhấn vào đây để xem trực tiếp
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
