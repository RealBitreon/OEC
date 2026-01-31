'use client'

import { useState, useEffect } from 'react'
import { User } from '../../core/types'
import { 
  updateUserProfile,
  changePassword,
  updateNotificationSettings,
  getNotificationSettings,
  getUserPreferences
} from '../../actions/settings'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { Icons } from '@/components/icons'

type TabType = 'profile' | 'system' | 'notifications' | 'security' | 'appearance'

interface SettingsProps {
  profile: User
}

export default function Settings({ profile }: SettingsProps) {
  const isCEO = profile.role === 'CEO'
  const isLRCManager = profile.role === 'LRC_MANAGER'
  const isStudent = !isCEO && !isLRCManager
  
  // CEO and LRC Manager: Only Security and Themes
  // Students: All tabs
  const [activeTab, setActiveTab] = useState<TabType>(isStudent ? 'profile' : 'security')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">الإعدادات</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          {(isCEO || isLRCManager) ? 'إدارة إعدادات الأمان والمظهر' : 'إدارة إعدادات النظام والحساب الشخصي'}
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`rounded-lg p-4 animate-fade-in ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{message.type === 'success' ? '✓' : '✗'}</span>
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto">
          <nav className="flex min-w-max">
            {/* CEO and LRC Manager: Only Security and Themes */}
            {(isCEO || isLRCManager) ? (
              <>
                <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon="🔒" label="الأمان" />
                <TabButton active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} icon="🎨" label="المظهر" />
              </>
            ) : (
              <>
                {/* Students: Full access */}
                <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon="👤" label="الملف الشخصي" />
                <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon="🔔" label="الإشعارات" />
                <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon="🔒" label="الأمان" />
                <TabButton active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} icon="🎨" label="المظهر" />
              </>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings profile={profile} onSave={showMessage} saving={saving} setSaving={setSaving} />}
          {activeTab === 'notifications' && <NotificationsTab profile={profile} onSave={showMessage} saving={saving} setSaving={setSaving} />}
          {activeTab === 'security' && <SecurityTab profile={profile} onSave={showMessage} saving={saving} setSaving={setSaving} />}
          {activeTab === 'appearance' && <AppearanceTab profile={profile} onSave={showMessage} saving={saving} setSaving={setSaving} />}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      active 
        ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
    }`}>
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  )
}


// Profile Settings
function ProfileSettings({ profile, onSave, saving, setSaving }: any) {
  const [formData, setFormData] = useState({
    display_name: profile.display_name || profile.username,
    email: profile.email || '',
    phone: profile.phone || '',
    bio: profile.bio || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    if (!email) return true // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    if (!phone) return true // Phone is optional
    const phoneRegex = /^(\+966|0)?5[0-9]{8}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.display_name.trim()) {
      newErrors.display_name = 'الاسم الكامل مطلوب'
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح (مثال: 0512345678)'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    setSaving(true)
    try {
      await updateUserProfile(profile.id, formData)
      onSave('success', 'تم حفظ التغييرات بنجاح')
    } catch (error: any) {
      onSave('error', error.message || 'فشل حفظ التغييرات')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">المعلومات الشخصية</h2>
        
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">{(formData.display_name || profile.username).charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <button type="button" className="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
              تغيير الصورة
            </button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">JPG, PNG أو GIF (حد أقصى 2MB)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">اسم المستخدم</label>
            <input type="text" value={profile.username} disabled className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">لا يمكن تغيير اسم المستخدم</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">الاسم الكامل</label>
            <input type="text" value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} 
              className={`w-full px-4 py-2 border ${errors.display_name ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} dark:bg-neutral-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} 
              placeholder="أدخل اسمك الكامل" />
            {errors.display_name && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.display_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">البريد الإلكتروني</label>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} 
              className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} dark:bg-neutral-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} 
              placeholder="example@email.com" />
            {errors.email && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">رقم الهاتف</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} dark:bg-neutral-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} 
              placeholder="+966 5X XXX XXXX" />
            {errors.phone && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">نبذة عني</label>
          <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={4}
            className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
            placeholder="اكتب نبذة مختصرة عنك..." />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button type="button" onClick={() => setFormData({
          display_name: profile.display_name || profile.username,
          email: profile.email || '',
          phone: profile.phone || '',
          bio: profile.bio || ''
        })} className="px-6 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">إلغاء</button>
        <button type="submit" disabled={saving} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </form>
  )
}



// Notifications Settings
function NotificationsTab({ profile, onSave, saving, setSaving }: any) {
  const [settings, setSettings] = useState({
    email_notifications: true,
    submission_notifications: true,
    competition_notifications: true,
    wheel_notifications: true,
    weekly_digest: false
  })
  const [loading, setLoading] = useState(true)

  // Load notification settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await getNotificationSettings(profile.id)
        setSettings(userSettings)
      } catch (error) {
        console.error('Failed to load notification settings:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [profile.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateNotificationSettings(profile.id, settings)
      onSave('success', 'تم حفظ إعدادات الإشعارات بنجاح')
    } catch (error: any) {
      onSave('error', error.message || 'فشل حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">إعدادات الإشعارات</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">اختر الإشعارات التي تريد استلامها</p>
        
        <div className="space-y-3">
          <ToggleOption label="إشعارات البريد الإلكتروني" description="استلام الإشعارات عبر البريد الإلكتروني" icon="📧"
            checked={settings.email_notifications} onChange={checked => setSettings({ ...settings, email_notifications: checked })} />
          
          <ToggleOption label="إشعارات الإجابات" description="إشعار عند مراجعة إجاباتك" icon="📝"
            checked={settings.submission_notifications} onChange={checked => setSettings({ ...settings, submission_notifications: checked })} />
          
          <ToggleOption label="إشعارات المسابقات" description="إشعار عند بدء أو انتهاء مسابقة" icon="🏆"
            checked={settings.competition_notifications} onChange={checked => setSettings({ ...settings, competition_notifications: checked })} />
          
          <ToggleOption label="إشعارات عجلة الحظ" description="إشعار عند إجراء السحب" icon="🎡"
            checked={settings.wheel_notifications} onChange={checked => setSettings({ ...settings, wheel_notifications: checked })} />
          
          <ToggleOption label="ملخص أسبوعي" description="استلام ملخص أسبوعي بالنشاطات" icon="📊"
            checked={settings.weekly_digest} onChange={checked => setSettings({ ...settings, weekly_digest: checked })} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button type="button" className="px-6 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">إلغاء</button>
        <button type="submit" disabled={saving} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
    </form>
  )
}

// Security Settings
function SecurityTab({ profile, onSave, saving, setSaving }: any) {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')

  const checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak'
    
    let strength = 0
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    if (strength >= 3) return 'strong'
    if (strength >= 2) return 'medium'
    return 'weak'
  }

  const handlePasswordChange = (value: string) => {
    setPasswords({ ...passwords, new: value })
    setPasswordStrength(checkPasswordStrength(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwords.current) {
      onSave('error', 'يرجى إدخال كلمة المرور الحالية')
      return
    }

    if (passwords.new !== passwords.confirm) {
      onSave('error', 'كلمات المرور الجديدة غير متطابقة')
      return
    }

    if (passwords.new.length < 8) {
      onSave('error', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }

    if (passwordStrength === 'weak') {
      onSave('error', 'كلمة المرور ضعيفة جداً. استخدم مزيجاً من الأحرف والأرقام والرموز')
      return
    }

    setSaving(true)
    try {
      await changePassword(profile.id, passwords.current, passwords.new)
      onSave('success', 'تم تغيير كلمة المرور بنجاح')
      setPasswords({ current: '', new: '', confirm: '' })
      setPasswordStrength('weak')
    } catch (error: any) {
      onSave('error', error.message || 'فشل تغيير كلمة المرور')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">الأمان وكلمة المرور</h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">كلمة المرور الحالية</label>
            <input 
              type="password" 
              value={passwords.current} 
              onChange={e => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="أدخل كلمة المرور الحالية" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">كلمة المرور الجديدة</label>
            <input 
              type="password" 
              value={passwords.new} 
              onChange={e => handlePasswordChange(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="أدخل كلمة المرور الجديدة" 
              required 
            />
            
            {/* Password Strength Indicator */}
            {passwords.new && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${
                      passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                      passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                      'w-full bg-green-500'
                    }`} />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-red-600' :
                    passwordStrength === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength === 'weak' ? 'ضعيفة' :
                     passwordStrength === 'medium' ? 'متوسطة' : 'قوية'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  استخدم 12 حرفاً على الأقل مع مزيج من الأحرف الكبيرة والصغيرة والأرقام والرموز
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">تأكيد كلمة المرور الجديدة</label>
            <input 
              type="password" 
              value={passwords.confirm} 
              onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="أعد إدخال كلمة المرور الجديدة" 
              required 
            />
            {passwords.confirm && passwords.new !== passwords.confirm && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">كلمات المرور غير متطابقة</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => {
                setPasswords({ current: '', new: '', confirm: '' })
                setPasswordStrength('weak')
              }}
              className="px-6 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              disabled={saving || !passwords.current || !passwords.new || !passwords.confirm || passwords.new !== passwords.confirm}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
            </button>
          </div>
        </form>
      </div>

      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">الجلسات النشطة</h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">إدارة الأجهزة التي تم تسجيل الدخول منها</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600">
            <div className="flex items-center gap-3">
              <Icons.code className="w-6 h-6 " />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">الجلسة الحالية</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Windows • Chrome • {new Date().toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
            <span className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full font-medium">نشط الآن</span>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">نصائح الأمان</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>استخدم كلمة مرور فريدة لا تستخدمها في مواقع أخرى</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>قم بتغيير كلمة المرور بشكل دوري (كل 3-6 أشهر)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>لا تشارك كلمة المرور مع أي شخص</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>تأكد من تسجيل الخروج عند استخدام جهاز مشترك</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Appearance Settings
function AppearanceTab({ profile, onSave, saving, setSaving }: any) {
  const { theme: currentTheme, setTheme: setGlobalTheme, actualTheme } = useTheme()
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(currentTheme)
  const [language, setLanguage] = useState('ar')
  const [fontSize, setFontSize] = useState('medium')
  const [compactMode, setCompactMode] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getUserPreferences(profile.id)
        setTheme(prefs.theme as 'light' | 'dark' | 'auto')
        setLanguage(prefs.language)
        setFontSize(prefs.fontSize)
        setCompactMode(prefs.compactMode)
      } catch (error) {
        console.error('Failed to load preferences:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPreferences()
  }, [profile.id])

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme)
    setGlobalTheme(newTheme)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateUserProfile(profile.id, {
        display_name: profile.display_name || profile.username,
        theme,
        language,
        fontSize,
        compact_mode: compactMode
      } as any)
      onSave('success', 'تم حفظ إعدادات المظهر بنجاح')
    } catch (error: any) {
      onSave('error', error.message || 'فشل حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">المظهر والعرض</h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">قم بتخصيص مظهر لوحة التحكم حسب تفضيلاتك</p>
        
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">نمط المظهر</label>
            <div className="grid grid-cols-3 gap-3">
              <ThemeOption 
                selected={theme === 'light'} 
                onClick={() => handleThemeChange('light')} 
                icon="☀️" 
                label="فاتح"
                description="مظهر فاتح ومريح للعين" 
              />
              <ThemeOption 
                selected={theme === 'dark'} 
                onClick={() => handleThemeChange('dark')} 
                icon="🌙" 
                label="داكن"
                description="مظهر داكن يقلل إجهاد العين" 
              />
              <ThemeOption 
                selected={theme === 'auto'} 
                onClick={() => handleThemeChange('auto')} 
                icon="🔄" 
                label="تلقائي"
                description="يتبع إعدادات النظام" 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              تم حفظ إعدادات المظهر بنجاح
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button 
          type="button" 
          onClick={() => { 
            handleThemeChange('light')
          }}
          className="px-6 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        >
          إعادة تعيين
        </button>
        <button 
          type="submit" 
          disabled={saving} 
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </form>
  )
}

// Helper Components
function ToggleOption({ label, description, checked, onChange, icon }: { label: string, description: string, checked: boolean, onChange: (checked: boolean) => void, icon?: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <p className="font-medium text-neutral-900 dark:text-white">{label}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-neutral-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

function ThemeOption({ selected, onClick, icon, label, description }: any) {
  return (
    <button 
      type="button" 
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all text-center ${
        selected 
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
          : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
      }`}
    >
      <span className="text-3xl block mb-2">{icon}</span>
      <span className="text-sm font-medium block mb-1 dark:text-white">{label}</span>
      {description && <span className="text-xs text-neutral-600 dark:text-neutral-400 block">{description}</span>}
    </button>
  )
}
