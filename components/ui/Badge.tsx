'use client';

import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = ({ 
  variant = 'default', 
  size = 'md',
  className = '', 
  children, 
  ...props 
}: BadgeProps) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    success: 'bg-green-100 text-green-700 border-green-300',
    danger: 'bg-red-100 text-red-700 border-red-300',
    warning: 'bg-amber-100 text-amber-700 border-amber-300',
    info: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-medium rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};
