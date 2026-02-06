'use client';

import { Icons } from '@/components/icons';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisible?: number;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisible = 5,
  className = '',
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the start or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisible);
    }
    if (currentPage >= totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisible + 1);
    }
    
    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {/* First Page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="الصفحة الأولى"
          className="hidden sm:flex"
        >
          <Icons.ChevronsRight className="w-4 h-4" />
        </Button>
      )}
      
      {/* Previous Page */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="الصفحة السابقة"
      >
        <Icons.ChevronRight className="w-4 h-4" />
        <span className="hidden sm:inline mr-1">السابق</span>
      </Button>
      
      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-neutral-500 dark:text-neutral-400"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }
          
          const pageNum = page as number;
          const isActive = pageNum === currentPage;
          
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              aria-label={`الصفحة ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
              className={`
                min-w-[40px] h-10 px-3 rounded-lg font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600'
                }
              `}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      
      {/* Next Page */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="الصفحة التالية"
      >
        <span className="hidden sm:inline ml-1">التالي</span>
        <Icons.ChevronLeft className="w-4 h-4" />
      </Button>
      
      {/* Last Page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="الصفحة الأخيرة"
          className="hidden sm:flex"
        >
          <Icons.ChevronsLeft className="w-4 h-4" />
        </Button>
      )}
    </nav>
  );
};
