'use client';

import { Icons } from '@/components/icons';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
  className?: string;
}

export const ErrorState = ({
  title = 'حدث خطأ',
  message = 'عذراً، حدث خطأ أثناء تحميل البيانات',
  onRetry,
  retryLabel = 'إعادة المحاولة',
  showIcon = true,
  className = '',
}: ErrorStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {showIcon && (
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <Icons.AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="primary"
          leftIcon={<Icons.RefreshCw className="w-4 h-4" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
