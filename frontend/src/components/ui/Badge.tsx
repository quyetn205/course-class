import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-success/20 text-emerald-800 dark:bg-success/20 dark:text-emerald-400',
    warning: 'bg-warning/20 text-amber-800 dark:bg-warning/20 dark:text-amber-400',
    danger: 'bg-danger/20 text-rose-800 dark:bg-danger/20 dark:text-rose-400',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
