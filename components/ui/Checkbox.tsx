'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          type="checkbox"
          className={`
            mt-0.5 h-5 w-5 rounded
            border-2 ${error ? 'border-red-500' : 'border-neutral-300'}
            text-blue-600
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            transition-all duration-200
            ${className}
          `}
          {...props}
        />
        {label && (
          <label className={`text-sm ${error ? 'text-red-600' : 'text-neutral-700'}`}>
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
