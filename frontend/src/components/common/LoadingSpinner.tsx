// No imports needed
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ className = 'w-8 h-8' }: { className?: string }) => {
  return (
    <div className="flex items-center justify-center p-8 w-full h-full">
      <Loader2 className={`animate-spin text-primary-500 ${className}`} />
    </div>
  );
};
