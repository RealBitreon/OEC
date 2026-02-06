'use client';

import { Modal } from './Modal';
import { Button } from './Button';
import { Icons } from '@/components/icons';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'warning',
  isLoading = false,
}: ConfirmDialogProps) => {
  const variantStyles = {
    danger: {
      icon: <Icons.AlertTriangle className="w-6 h-6 text-red-600" />,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      buttonVariant: 'danger' as const,
    },
    warning: {
      icon: <Icons.AlertCircle className="w-6 h-6 text-amber-600" />,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      buttonVariant: 'primary' as const,
    },
    info: {
      icon: <Icons.Info className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      buttonVariant: 'primary' as const,
    },
  };

  const style = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full ${style.bgColor} flex items-center justify-center flex-shrink-0`}>
            {style.icon}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          
          <Button
            variant={style.buttonVariant}
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
