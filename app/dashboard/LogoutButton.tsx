'use client'

import { Button } from '@/components/ui/Button'
import { logoutAction } from './actions'
import { useState } from 'react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logoutAction()
    } catch (error) {
      console.error('Logout error:', error)
      setLoading(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleLogout}
      loading={loading}
      disabled={loading}
    >
      تسجيل الخروج
    </Button>
  )
}
