'use client'

import ReCAPTCHA from 'react-google-recaptcha'
import { useRef } from 'react'

interface ReCaptchaProps {
  onVerify: (token: string | null) => void
  onExpired?: () => void
  onError?: () => void
}

export default function ReCaptcha({ onVerify, onExpired, onError }: ReCaptchaProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  if (!siteKey) {
    console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set')
    return null
  }

  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={onVerify}
        onExpired={onExpired}
        onErrored={onError}
        theme="light"
      />
    </div>
  )
}
