'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/api'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDishes: 0,
    totalUsers: 0,
    totalReflections: 0,
    activeDishes: 0
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData.role !== 'admin') {
          router.push('/dashboard')
          return
        }
        setUser(userData)

        // Fetch stats
        try {
          const response = await fetch('http://localhost:3001/api/admin/reflections/stats', {
            credentials: 'include'
          })
          const data = await response.json()
          setStats(prev => ({
            ...prev,
            totalDishes: data.length,
            totalReflections: data.reduce((sum: number, d: any) => sum + (d.reflection_count || 0), 0)
          }))
        } catch (err) {
          console.error('Failed to fetch stats')
        }
      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading admin dashboard...</p>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Unauthorized. Admin access required.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">DISHCOVERY Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-300 hover:text-white">
              Student View
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/dashboard" className="text-orange-400 hover:text-orange-300 font-semibold">
              Logout
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Administration Panel</h2>
          <p className="text-xl text-slate-300">
            Manage dishes, recipes, and view student engagement
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Dishes', value: stats.totalDishes, icon: '🍽️' },
            { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
            { label: 'Total Reflections', value: stats.totalReflections, icon: '📝' },
            { label: 'Active Dishes', value: stats.activeDishes, icon: '⭐' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold text-orange-400 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Manage Dishes */}
          <Link href="/admin/dishes" className="group">
            <div className="bg-slate-800 border border-slate-700 hover:border-orange-500 rounded-lg p-8 h-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition mb-3">
                Manage Dishes
              </h3>
              <p className="text-slate-400 mb-6">
                Create, edit, and delete dishes. Manage recipes, ingredients, and cooking techniques.
              </p>
              <div className="inline-block bg-orange-600 group-hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                Go to Dishes →
              </div>
            </div>
          </Link>

          {/* Manage Techniques */}
          <Link href="/admin/techniques" className="group">
            <div className="bg-slate-800 border border-slate-700 hover:border-orange-500 rounded-lg p-8 h-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
              <div className="text-5xl mb-4">🔪</div>
              <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition mb-3">
                Manage Techniques
              </h3>
              <p className="text-slate-400 mb-6">
                Add and manage cutting techniques, cooking methods, and skill demonstrations for students.
              </p>
              <div className="inline-block bg-orange-600 group-hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                Go to Techniques →
              </div>
            </div>
          </Link>

          {/* View Analytics */}
          <div className="group">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 h-full opacity-60 cursor-not-allowed">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Analytics
              </h3>
              <p className="text-slate-400 mb-6">
                View student engagement, popular dishes, and learning metrics.
              </p>
              <div className="inline-block bg-slate-700 text-slate-400 font-semibold py-2 px-6 rounded-lg">
                Coming Soon
              </div>
            </div>
          </div>

          {/* Content Library */}
          <div className="group">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 h-full opacity-60 cursor-not-allowed">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Content Library
              </h3>
              <p className="text-slate-400 mb-6">
                Manage video tutorials, technique references, and educational materials.
              </p>
              <div className="inline-block bg-slate-700 text-slate-400 font-semibold py-2 px-6 rounded-lg">
                Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/dishes" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition text-center">
              + Add New Dish
            </Link>
            <Link href="/admin/techniques" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition text-center">
              + Add Technique
            </Link>
            <Link href="/dashboard" className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition text-center">
              View as Student
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
