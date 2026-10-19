import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 mb-6 font-black text-4xl shadow-inner">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Không tìm thấy trang
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Đường dẫn bạn đang truy cập không tồn tại hoặc đã được di chuyển sang địa chỉ khác.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" /> Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
