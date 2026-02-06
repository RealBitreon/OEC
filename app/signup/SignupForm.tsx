'use client'

import { useState, FormEvent, useEffect, useRef } from 'react'
import { signupAction } from './actions'
import { applyCustomValidation } from '@/lib/utils/form-validation'
import { useToast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Icons } from '@/components/icons'

export default function SignupForm() {
  const { showToast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    roleCode: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Apply custom validation messages with toast
  useEffect(() => {
    if (formRef.current) {
      applyCustomValidation(formRef.current, (message, type) => {
        showToast(message, type)
      })
    }
  }, [showToast])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب'
    } else if (formData.username.length < 3) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'
    } else if (formData.username.length > 30) {
      newErrors.username = 'اسم المستخدم يجب ألا يتجاوز 30 حرف'
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة'
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }
    
    if (!formData.roleCode.trim()) {
      newErrors.roleCode = 'رمز الدور مطلوب'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('username', formData.username.trim())
      formDataObj.append('password', formData.password)
      formDataObj.append('roleCode', formData.roleCode.trim())

      const result = await signupAction(formDataObj)

      if (result?.error) {
        showToast(result.error, 'error')
        setLoading(false)
      }
      // If no error, the redirect will happen automatically
    } catch (error: any) {
      // Ignore NEXT_REDIRECT errors - they're expected behavior
      if (error?.message?.includes('NEXT_REDIRECT')) {
        return
      }
      // Handle other errors
      showToast('حدث خطأ غير متوقع', 'error')
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" dir="rtl" noValidate>
      <Input
        label="اسم المستخدم"
        type="text"
        value={formData.username}
        onChange={(e) => handleChange('username', e.target.value)}
        error={errors.username}
        helperText="3-30 حرف (حروف، أرقام، وشرطة سفلية فقط)"
        placeholder="أدخل اسم المستخدم"
        required
        disabled={loading}
        leftIcon={<Icons.user className="w-5 h-5" />}
        autoFocus
        autoComplete="username"
      />

      <Input
        label="كلمة المرور"
        type="password"
        value={formData.password}
        onChange={(e) => handleChange('password', e.target.value)}
        error={errors.password}
        helperText="6 أحرف على الأقل"
        placeholder="••••••••"
        required
        disabled={loading}
        leftIcon={<Icons.lock className="w-5 h-5" />}
        showPasswordToggle
        autoComplete="new-password"
      />

      <Input
        label="رمز الدور"
        type="text"
        value={formData.roleCode}
        onChange={(e) => handleChange('roleCode', e.target.value)}
        error={errors.roleCode}
        helperText="رمز خاص للمديرين والمشرفين فقط. يرجى الحصول على الرمز من المسؤول."
        placeholder="أدخل رمز الدور"
        required
        disabled={loading}
        leftIcon={<Icons.key className="w-5 h-5" />}
        autoComplete="off"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
      </Button>
    </form>
  )
}

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" dir="rtl" suppressHydrationWarning noValidate>
      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-l from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-4 text-center shadow-sm animate-shake" suppressHydrationWarning>
          <div className="flex items-center justify-center gap-2">
            <p className="text-red-700 text-sm font-semibold">{error}</p>
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      )}

      {/* Username Field */}
      <div className="relative" suppressHydrationWarning>
        <label htmlFor="username" className="block text-sm font-bold text-neutral-700 mb-2 text-right flex items-center justify-end gap-2">
          <span>اسم المستخدم</span>
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </label>
        <div className="relative group" suppressHydrationWarning>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="أدخل اسم المستخدم"
            required
            minLength={3}
            maxLength={30}
            disabled={loading}
            className="w-full px-5 py-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-bl from-white to-emerald-50/30 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-neutral-100 disabled:cursor-not-allowed transition-all duration-300 text-right text-lg font-medium shadow-sm hover:shadow-md hover:border-emerald-300"
            dir="rtl"
            autoFocus
            autoComplete="off"
            data-form-type="other"
            suppressHydrationWarning
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-xs text-neutral-500 text-right flex items-center justify-end gap-1">
          <span>3-30 حرف (حروف، أرقام، وشرطة سفلية فقط)</span>
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </p>
      </div>

      {/* Password Field */}
      <div className="relative" suppressHydrationWarning>
        <label htmlFor="password" className="block text-sm font-bold text-neutral-700 mb-2 text-right flex items-center justify-end gap-2">
          <span>كلمة المرور</span>
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </label>
        <div className="relative group" suppressHydrationWarning>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            minLength={6}
            disabled={loading}
            className="w-full px-5 py-4 pl-14 rounded-xl border-2 border-emerald-200 bg-gradient-to-bl from-white to-emerald-50/30 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-neutral-100 disabled:cursor-not-allowed transition-all duration-300 text-right text-lg font-medium shadow-sm hover:shadow-md hover:border-emerald-300"
            dir="rtl"
            autoComplete="new-password"
            data-form-type="other"
            suppressHydrationWarning
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-600 focus:outline-none transition-colors duration-200 p-1 rounded-lg hover:bg-emerald-50"
            disabled={loading}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-500 text-right">6 أحرف على الأقل</p>
      </div>

      {/* Role Code Field */}
      <div className="relative" suppressHydrationWarning>
        <label htmlFor="roleCode" className="block text-sm font-bold text-neutral-700 mb-2 text-right flex items-center justify-end gap-2">
          <span>رمز الدور (مطلوب)</span>
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </label>
        <div className="relative group" suppressHydrationWarning>
          <input
            id="roleCode"
            name="roleCode"
            type="text"
            value={formData.roleCode}
            onChange={handleChange}
            placeholder="أدخل رمز الدور"
            required
            disabled={loading}
            className="w-full px-5 py-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-bl from-white to-emerald-50/30 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-neutral-100 disabled:cursor-not-allowed transition-all duration-300 text-right text-lg font-medium shadow-sm hover:shadow-md hover:border-emerald-300"
            dir="rtl"
            autoComplete="off"
            data-form-type="other"
            suppressHydrationWarning
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-xs text-neutral-500 text-right flex items-center justify-end gap-1">
          <span>رمز خاص للمديرين والمشرفين فقط. يرجى الحصول على الرمز من المسؤول.</span>
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading || !formData.username || !formData.password || !formData.roleCode}
          className="w-full relative overflow-hidden bg-gradient-to-l from-emerald-500 via-green-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
        >
          <div className="absolute inset-0 bg-gradient-to-l from-emerald-600 via-green-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center gap-2 text-lg">
            {loading ? (
              <>
                <span>جاري إنشاء الحساب...</span>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : (
              <>
                <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
                <span>إنشاء حساب</span>
              </>
            )}
          </div>
          {/* Shine Effect */}
          <div className="absolute inset-0 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 bg-gradient-to-l from-transparent via-white/20 to-transparent"></div>
        </button>
      </div>
    </form>
  )
}
