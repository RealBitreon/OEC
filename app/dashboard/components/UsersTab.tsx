'use client'

import { useState } from 'react'
import type { User } from '@/lib/auth/types'
import { updateUserRole } from '../actions'

interface UsersTabProps {
  users: User[]
  setUsers: (users: User[]) => void
}

export default function UsersTab({ users, setUsers }: UsersTabProps) {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleRoleChange = async (username: string, newRole: 'ceo' | 'lrc_manager' | 'student') => {
    if (!confirm(`هل تريد تغيير دور ${username} إلى ${newRole}؟`)) return

    setLoading(true)
    try {
      const result = await updateUserRole(username, newRole)
      if (result.success) {
        setUsers(result.users!)
        showToast('تم تحديث الدور بنجاح', 'success')
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">المستخدمون</h1>
        <p className="text-neutral-600">إدارة المستخدمين والأدوار</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">اسم المستخدم</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">الدور</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">تاريخ الإنشاء</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {users.map(user => (
              <tr key={user.username} className="hover:bg-neutral-50">
                <td className="px-6 py-4 text-sm font-medium text-neutral-900">{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.role === 'ceo' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'lrc_manager' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role === 'ceo' ? 'CEO' : user.role === 'lrc_manager' ? 'مسؤول LRC' : 'طالب'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {new Date(user.createdAt).toLocaleDateString('ar-OM')}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.username, e.target.value as any)}
                    disabled={loading}
                    className="px-3 py-1 border border-neutral-200 rounded text-sm outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="student">طالب</option>
                    <option value="lrc_manager">مسؤول LRC</option>
                    <option value="ceo">CEO</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className={`fixed bottom-4 left-4 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white font-semibold z-50`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
