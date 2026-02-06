'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { tokens } from '@/lib/ui/tokens';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    fullWidth = false,
    disabled,
    className = '',
    children,
    leftIcon,
    rightIcon,
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-emerald-600 to-emerald-700
        hover:from-emerald-700 hover:to-emerald-800
        text-white shadow-md hover:shadow-lg
        focus:ring-emerald-500
        active:scale-[0.98]
        dark:from-emerald-500 dark:to-emerald-600
      `,
      secondary: `
        bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600
        hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700
        text-neutral-900 dark:text-white shadow-sm
        focus:ring-neutral-400
        active:scale-[0.98]
      `,
      outline: `
        bg-transparent border-2 border-neutral-300 dark:border-neutral-600
        hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800
        text-neutral-700 dark:text-neutral-300
        focus:ring-neutral-400
        active:scale-[0.98]
      `,
      ghost: `
        bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800
        text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white
        focus:ring-neutral-400
      `,
      danger: `
        bg-gradient-to-r from-red-600 to-red-700
        hover:from-red-700 hover:to-red-800
        text-white shadow-md hover:shadow-lg
        focus:ring-red-500
        active:scale-[0.98]
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <svg 
            className="animate-spin h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
