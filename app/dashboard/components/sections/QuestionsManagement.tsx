'use client'

import Link from 'next/link'
import Icons from '@/components/icons'
import { User } from '../../core/types'

interface QuestionsManagementProps {
  profile: User
  mode: 'bank' | 'training'
}

export default function QuestionsManagement({ profile, mode }: QuestionsManagementProps) {
  const isTraining = mode === 'training'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">
          {isTraining ? 'أسئلة التدريب' : 'بنك الأسئلة'}
        </h2>
        <Link
          href={isTraining ? '/questions?filter=training' : '/questions'}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Icons.eye className="w-5 h-5" />
          <span>عرض جميع الأسئلة</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <Icons.help className={`w-16 h-16 mx-auto mb-4 ${isTraining ? 'text-purple-600' : 'text-primary'}`} />
          <h3 className="text-xl font-bold text-neutral-800 mb-2">
            {isTraining ? 'أسئلة التدريب' : 'بنك الأسئلة'}
          </h3>
          <p className="text-neutral-600 mb-6">
            {isTraining 
              ? 'يمكن للطلاب التدرب على هذه الأسئلة قبل المشاركة في المسابقات الفعلية'
              : 'يمكنك عرض وإدارة جميع أسئلة المسابقات من خلال صفحة الأسئلة'
            }
          </p>
          <Link
            href={isTraining ? '/questions?filter=training' : '/questions'}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isTraining
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-primary hover:bg-primary-dark text-white'
            }`}
          >
            <Icons.arrow className="w-5 h-5" />
            انتقل إلى {isTraining ? 'أسئلة التدريب' : 'صفحة الأسئلة'}
          </Link>
        </div>
      </div>
    </div>
  )
}
