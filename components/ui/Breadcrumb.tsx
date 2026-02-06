'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <Icons.ChevronLeft
                  className="w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              
              {isLast ? (
                <span
                  className="flex items-center gap-2 text-neutral-900 dark:text-white font-medium"
                  aria-current="page"
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="truncate max-w-[200px] sm:max-w-none">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="truncate max-w-[150px] sm:max-w-none">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
