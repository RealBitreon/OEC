'use client';

import { Icons } from '@/components/icons';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState = ({
  message = 'جاري التحميل...',
  size = 'md',
  className = '',
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className={`${sizeClasses[size]} mb-4`}>
        <Icons.Loader className="w-full h-full text-emerald-600 dark:text-emerald-400 animate-spin" />
      </div>
      
      <p className={`text-neutral-600 dark:text-neutral-400 ${textSizeClasses[size]}`}>
        {message}
      </p>
      
      <span className="sr-only">{message}</span>
    </div>
  );
};
