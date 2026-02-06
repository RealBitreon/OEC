'use client';

import { Breadcrumb, BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { DashboardSection } from '../core/types';
import { Icons } from '@/components/icons';

interface DashboardBreadcrumbProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

const SECTION_LABELS: Record<DashboardSection, { label: string; icon: React.ReactNode }> = {
  overview: { label: 'نظرة عامة', icon: <Icons.chart className="w-4 h-4" /> },
  competitions: { label: 'إدارة المسابقات', icon: <Icons.trophy className="w-4 h-4" /> },
  'training-questions': { label: 'الأسئلة التدريبية', icon: <Icons.help className="w-4 h-4" /> },
  'question-bank': { label: 'مكتبة الأسئلة', icon: <Icons.library className="w-4 h-4" /> },
  archives: { label: 'الإصدارات السابقة', icon: <Icons.archive className="w-4 h-4" /> },
  settings: { label: 'الإعدادات', icon: <Icons.settings className="w-4 h-4" /> },
  users: { label: 'المستخدمون', icon: <Icons.users className="w-4 h-4" /> },
  audit: { label: 'سجل التدقيق', icon: <Icons.file className="w-4 h-4" /> },
};

export default function DashboardBreadcrumb({ activeSection, onSectionChange }: DashboardBreadcrumbProps) {
  const currentSection = SECTION_LABELS[activeSection];
  
  const items: BreadcrumbItem[] = [
    {
      label: 'لوحة التحكم',
      href: '#',
      icon: <Icons.home className="w-4 h-4" />,
    },
    {
      label: currentSection.label,
      icon: currentSection.icon,
    },
  ];

  return (
    <div className="mb-6">
      <Breadcrumb items={items} />
    </div>
  );
}
