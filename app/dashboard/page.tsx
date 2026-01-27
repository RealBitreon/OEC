import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('student_id')?.value
  
  // Check authentication using cookie-based auth
  if (!studentId) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Get student profile from student_participants table
  const { data: student } = await supabase
    .from('student_participants')
    .select('username, role')
    .eq('id', studentId)
    .single()

  const displayName = student?.username || 'مستخدم'
  const userRole = student?.role || 'student'

  return (
    <div className="min-h-screen bg-neutral-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">لوحة التحكم</h1>
            <p className="text-neutral-600">مرحباً {displayName}</p>
            {userRole !== 'student' && (
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {userRole === 'ceo' ? 'المدير التنفيذي' : userRole === 'manager' ? 'مدير' : userRole}
              </span>
            )}
          </div>
          <LogoutButton />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">قيد التطوير</h2>
            <p className="text-neutral-600 mb-6">
              لوحة التحكم قيد التطوير حالياً. سيتم إضافة المزيد من الميزات قريباً.
            </p>
            <div className="space-y-2 text-right">
              <p className="text-sm text-neutral-500">✨ إدارة المسابقات</p>
              <p className="text-sm text-neutral-500">✨ إدارة الأسئلة</p>
              <p className="text-sm text-neutral-500">✨ مراجعة الإجابات</p>
              <p className="text-sm text-neutral-500">✨ إدارة التذاكر</p>
              <p className="text-sm text-neutral-500">✨ عجلة السحب</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
