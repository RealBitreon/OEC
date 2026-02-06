'use client'

import { useState, FormEvent, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from './actions'
import { applyCustomValidation } from '@/lib/utils/form-validation'
import { useToast } from '@/components/ui/Toast'
import { useAsyncOperation } from '@/lib/hooks/useAsyncOperation'
import { getErrorMessage } from '@/lib/utils/error-messages'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Icons } from '@/components/icons'

interface LoginFormProps {
  redirectTo?: string
}

export default function LoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const { loading, error, execute } = useAsyncOperation()

  // Apply custom validation messages with toast
  useEffect(() => {
    if (formRef.current) {
      applyCustomValidation(formRef.current, (message, type) => {
        showToast(message, type)
      })
    }
  }, [showToast])

  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string } = {}
    
    if (!username.trim()) {
      newErrors.username = 'يرجى إدخال اسم المستخدم'
    }
    
    if (!password) {
      newErrors.password = 'يرجى إدخال كلمة المرور'
    } else if (password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent double submission
    if (isSubmitting || loading) {
      console.log('Already submitting, ignoring...')
      return
    }

    // Validate form
    if (!validateForm()) {
      return
    }

    console.log('Form submitted with:', { username: username.trim(), hasPassword: !!password })

    setIsSubmitting(true)

    await execute(
      async () => {
        const formData = new FormData()
        formData.append('username', username.trim())
        formData.append('password', password)

        const result = await loginAction(formData)

        if (result?.error) {
          throw new Error(result.error)
        }
      },
      {
        onSuccess: () => {
          console.log('Login successful')
          showToast('تم تسجيل الدخول بنجاح', 'success')
          
          // Small delay for better UX
          setTimeout(() => {
            router.push(redirectTo)
            router.refresh()
          }, 500)
        },
        onError: (err) => {
          console.error('Login error:', err)
          const errorMessage = getErrorMessage(err.message)
          showToast(errorMessage, 'error')
          setIsSubmitting(false)
        },
        timeout: 15000,
      }
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      <Input
        label="اسم المستخدم"
        type="text"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value)
          if (errors.username) setErrors({ ...errors, username: undefined })
        }}
        error={errors.username}
        placeholder="أدخل اسم المستخدم"
        required
        disabled={isSubmitting || loading}
        leftIcon={<Icons.user className="w-5 h-5" />}
        autoComplete="username"
        autoFocus
      />

      <Input
        label="كلمة المرور"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          if (errors.password) setErrors({ ...errors, password: undefined })
        }}
        error={errors.password}
        placeholder="أدخل كلمة المرور"
        required
        disabled={isSubmitting || loading}
        leftIcon={<Icons.lock className="w-5 h-5" />}
        showPasswordToggle
        autoComplete="current-password"
      />

      {error && (
        <div
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          role="alert"
        >
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <Icons.AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{getErrorMessage(error)}</p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting || loading}
        disabled={isSubmitting || loading}
      >
        {isSubmitting || loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
      </Button>
    </form>
  )
}
