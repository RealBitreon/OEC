'use client';

import { ReactNode, useState } from 'react';
import { Badge } from '@/components/ui';

export interface DashboardShellProps {
  children: ReactNode;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  activeTab?: string;
  tabs?: {
    id: string;
    label: string;
    icon?: ReactNode;
  }[];
  onTabChange?: (tabId: string) => void;
  competitionStatus?: {
    label: string;
    variant: 'default' | 'success' | 'danger' | 'warning' | 'info';
  };
}

export const DashboardShell = ({
  children,
  user,
  activeTab,
  tabs = [],
  onTabChange,
  competitionStatus,
}: DashboardShellProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="القائمة"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-neutral-900">لوحة التحكم</h1>
            {competitionStatus && (
              <Badge variant={competitionStatus.variant} size="sm">
                {competitionStatus.label}
              </Badge>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-600">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 right-0 bottom-0
            w-64 bg-white border-l border-neutral-200
            transform transition-transform duration-300 ease-out
            lg:transform-none z-40
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange?.(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                        : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                    }
                  `}
                >
                  {tab.icon && <span className="text-lg">{tab.icon}</span>}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
