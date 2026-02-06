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
