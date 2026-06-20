'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/api'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser()
        router.push('/dashboard')
      } catch {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center">
      <p className="text-[#2E5A44] text-lg">Loading...</p>
    </div>
  )
}
