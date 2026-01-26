'use client';

import { ReactNode } from 'react';
import { Container } from '@/components/ui';

export interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const PageLayout = ({
  children,
  title,
  description,
  maxWidth = 'xl',
  className = '',
}: PageLayoutProps) => {
  return (
    <div className={`min-h-screen bg-neutral-50 py-8 ${className}`}>
      <Container size={maxWidth}>
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg text-neutral-600 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </div>
  );
};
