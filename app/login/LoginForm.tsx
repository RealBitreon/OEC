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
    console.log('Starting login at:', new Date().toISOString())

    setIsSubmitting(true)

    try {
      await execute(
        async () => {
          console.log('Calling loginAction...')
          const startTime = Date.now()
          
          const formData = new FormData()
          formData.append('username', username.trim())
          formData.append('password', password)

          const result = await loginAction(formData)
          
          const duration = Date.now() - startTime
          console.log(`loginAction completed in ${duration}ms`)

          if (result?.error) {
            console.error('Login action returned error:', result.error)
            throw new Error(result.error)
          }
          
          console.log('Login action succeeded')
        },
        {
          onSuccess: () => {
            console.log('Login successful, redirecting...')
            showToast('تم تسجيل الدخول بنجاح', 'success')
            
            // Small delay for better UX
            setTimeout(() => {
              console.log('Redirecting to:', redirectTo)
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
          timeout: 30000, // Increased to 30 seconds for debugging
        }
      )
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err)
      setIsSubmitting(false)
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-5">
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
          leftIcon={<Icons.user className="w-5 h-5 text-[#1a5f4f]" />}
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
          leftIcon={<Icons.lock className="w-5 h-5 text-[#1a5f4f]" />}
          showPasswordToggle
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div
          className="p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in"
          role="alert"
        >
          <div className="flex items-center gap-3 text-red-700">
            <Icons.AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{getErrorMessage(error)}</p>
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
        className="!mt-8 bg-gradient-to-r from-[#1a5f4f] to-[#2d7a67] hover:from-[#0f4438] hover:to-[#1a5f4f] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting || loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>جاري تسجيل الدخول...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>تسجيل الدخول</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </span>
        )}
      </Button>
    </form>
  )
}
