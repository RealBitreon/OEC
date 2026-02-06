'use client';

import { HTMLAttributes, forwardRef } from 'react';

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className = '', ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
      <table
        ref={ref}
        className={`w-full text-[10px] sm:text-xs md:text-sm ${className}`}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => (
    <thead
      ref={ref}
      className={`bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 ${className}`}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => (
    <tbody
      ref={ref}
      className={`divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-800 ${className}`}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', ...props }, ref) => (
    <tr
      ref={ref}
      className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${className}`}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', ...props }, ref) => (
    <th
      ref={ref}
      scope="col"
      className={`px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-right text-[10px] sm:text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider whitespace-nowrap ${className}`}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', ...props }, ref) => (
    <td
      ref={ref}
      className={`px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-neutral-900 dark:text-neutral-100 ${className}`}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';
