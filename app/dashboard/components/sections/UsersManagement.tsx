/**
 * Users Management Component
 * 
 * Admin interface for managing user accounts, roles, and permissions.
 * 
 * Features:
 * - List all users with search and filtering
 * - Create new user accounts
 * - Edit user profiles and roles
 * - Delete users (with protection against self-deletion)
 * - Reset user passwords
 * - View user statistics
 * 
 * Security:
 * - Only accessible to CEO and LRC_MANAGER roles
 * - Password reset requires admin privileges
 * - Self-deletion is prevented
 * 
 * Performance:
 * - Pagination for large user lists
 * - Client-side search for instant filtering
 * - Optimistic UI updates
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import { User } from '../../core/types'
import { getUsers, getUserStats, createUser, updateUser, deleteUser, resetUserPassword, type UserFilters } from '../../actions/users'
import { safeString } from '@/lib/utils/form-helpers'

interface UserData {
  id: string
  username: string
  email: string
  display_name: string
  role: 'user' | 'LRC_MANAGER' | 'CEO'
  phone?: string
  created_at: string
}

const ROLE_LABELS = {
  user: { label: 'مستخدم', icon: '👤', color: 'blue' },
  LRC_MANAGER: { label: 'مدير مسابقة', icon: '👨‍💼', color: 'green' },
  CEO: { label: 'مدير تنفيذي', icon: '👑', color: 'purple' }
}

export default function UsersManagement({ profile }: { profile: User }) {
  const [users, setUsers] = useState<UserData[]>([])
  const [stats, setStats] = useState({ total: 0, students: 0, managers: 0, ceos: 0, thisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<UserFilters>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let mounted = true
    
    const fetchData = async () => {
      setLoading(true)
      try {
        const [usersData, statsData] = await Promise.all([
          getUsers(filters, page),
          getUserStats()
        ])
        if (mounted) {
          setUsers(usersData.users)
          setTotalPages(usersData.pages)
          setStats(statsData)
        }
      } catch (error) {
        console.error('Failed to load users:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    fetchData()
    
    return () => {
      mounted = false
    }
  }, [filters, page])

  const loadData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        getUsers(filters, page),
        getUserStats()
      ])
      setUsers(usersData.users)
      setTotalPages(usersData.pages)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users

    const query = searchQuery.toLowerCase()
    return users.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  const handleDelete = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return
    }

    try {
      await deleteUser(userId)
      showToast('تم حذف المستخدم بنجاح', 'success')
      await loadData()
    } catch (error: any) {
      showToast(error?.message || 'فشل حذف المستخدم', 'error')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">إدارة المستخدمين</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">إدارة المستخدمين</h1>
          <p className="text-neutral-600 mt-1">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              setLoading(true)
              await loadData()
            }}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            <span>تحديث</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>+</span>
            إضافة مستخدم
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{stats.total}</div>
          <div className="text-sm text-neutral-600">إجمالي المستخدمين</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 bg-blue-50">
          <div className="text-3xl font-bold text-blue-700 mb-1">{stats.students}</div>
          <div className="text-sm text-blue-700">مستخدمون</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 bg-green-50">
          <div className="text-3xl font-bold text-green-700 mb-1">{stats.managers}</div>
          <div className="text-sm text-green-700">مدراء مسابقات</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200 bg-purple-50">
          <div className="text-3xl font-bold text-purple-700 mb-1">{stats.ceos}</div>
          <div className="text-sm text-purple-700">مدراء تنفيذيون</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-200 bg-yellow-50">
          <div className="text-3xl font-bold text-yellow-700 mb-1">{stats.thisMonth}</div>
          <div className="text-sm text-yellow-700">هذا الشهر</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">🔍 البحث</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مستخدم..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">👤 الدور</label>
            <select
              value={filters.role || ''}
              onChange={e => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              <option value="user">مستخدم</option>
              <option value="LRC_MANAGER">مدير مسابقة</option>
              <option value="CEO">مدير تنفيذي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <span className="text-4xl mb-4 block">👥</span>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">لا يوجد مستخدمون</h2>
          <p className="text-neutral-600">
            {searchQuery ? 'لا توجد نتائج تطابق البحث' : 'لا يوجد مستخدمون مسجلون'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">المستخدم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">البريد الإلكتروني</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">الهاتف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">الدور</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">تاريخ التسجيل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredUsers.map(user => {
                  const roleInfo = ROLE_LABELS[user.role]
                  
                  return (
                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-${roleInfo.color}-100 flex items-center justify-center text-${roleInfo.color}-700 font-medium`}>
                            {user.display_name?.[0] || user.username[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-900">
                              {user.display_name || user.username}
                            </div>
                            <div className="text-xs text-neutral-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        {user.email || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-${roleInfo.color}-100 text-${roleInfo.color}-700`}>
                          <span>{roleInfo.icon}</span>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {new Date(user.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowEditModal(true)
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === profile.id}
                            className="px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <span className="text-sm text-neutral-600">
                صفحة {page} من {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadData()
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedUser(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    display_name: '',
    role: 'user' as 'user' | 'LRC_MANAGER' | 'CEO',
    phone: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await createUser(formData)
      onSuccess()
    } catch (error: any) {
      alert(error?.message || 'فشل إنشاء المستخدم')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold">إضافة مستخدم جديد</h2>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <span className="text-2xl">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">اسم المستخدم *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">الاسم الكامل *</label>
              <input
                type="text"
                required
                value={formData.display_name}
                onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">البريد الإلكتروني *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">كلمة المرور *</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">الدور *</label>
              <select
                required
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">مستخدم</option>
                <option value="LRC_MANAGER">مدير مسابقة</option>
                <option value="CEO">مدير تنفيذي</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Edit User Modal
 * 
 * Allows admins to modify user information and reset passwords.
 * 
 * CRITICAL FIX: All form fields must be initialized with strings, never null.
 * React throws warnings if controlled inputs receive null values.
 * We use safeString() to convert null/undefined to empty strings.
 * 
 * Features:
 * - Edit display name, email, phone, and role
 * - Reset password with confirmation
 * - Optimistic concurrency (future: add version checking)
 */
function EditUserModal({ user, onClose, onSuccess }: { user: UserData; onClose: () => void; onSuccess: () => void }) {
  // CRITICAL: Use safeString() to ensure no null values in controlled inputs
  // This prevents React warning: "value prop on input should not be null"
  const [formData, setFormData] = useState({
    display_name: safeString(user.display_name),
    email: safeString(user.email),
    phone: safeString(user.phone),
    role: user.role
  })
  const [submitting, setSubmitting] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await updateUser(user.id, formData)
      onSuccess()
    } catch (error: any) {
      alert(error?.message || 'فشل تحديث المستخدم')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setSubmitting(true)
    try {
      await resetUserPassword(user.id, newPassword)
      alert('تم إعادة تعيين كلمة المرور بنجاح')
      setShowPasswordReset(false)
      setNewPassword('')
    } catch (error: any) {
      alert(error?.message || 'فشل إعادة تعيين كلمة المرور')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-6 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold">تعديل المستخدم</h2>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <span className="text-2xl">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-neutral-600">اسم المستخدم</div>
            <div className="text-lg font-medium text-neutral-900">@{user.username}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">الاسم الكامل</label>
              <input
                type="text"
                value={formData.display_name}
                onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">الدور</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">مستخدم</option>
                <option value="LRC_MANAGER">مدير مسابقة</option>
                <option value="CEO">مدير تنفيذي</option>
              </select>
            </div>
          </div>

          {/* Password Reset Section */}
          <div className="pt-6 border-t border-neutral-200">
            {!showPasswordReset ? (
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                🔑 إعادة تعيين كلمة المرور
              </button>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700">كلمة المرور الجديدة</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة"
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    تأكيد
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordReset(false)
                      setNewPassword('')
                    }}
                    className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
