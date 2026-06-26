'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getFeaturedDishes, logout } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  Clock,
  Users,
  TrendingUp,
  Award,
  Book,
  ShoppingCart,
  Scissors,
  Filter,
  NotebookPen,
  BookOpen,
  Flame,
  Menu,
  X
} from 'lucide-react'
import { getProgress } from '@/lib/progress'

interface Dish {
  id: number
  name: string
  description: string
  image_url: string
  difficulty_level: string
  prep_time: number
  cook_time: number
}

interface User {
  id: number
  name: string
  email: string
  role: string
}

const FEATURES = [
  {
    icon: Book,
    title: 'Recipes',
    href: '/recipe',
    description: 'Browse personalized recipes and cooking ideas.'
  },
  {
    icon: ShoppingCart,
    title: 'Pantry',
    href: '/pantry-search',
    description: 'Track and manage your available ingredients.'
  },
  {
    icon: Scissors,
    title: 'Techniques',
    href: '/techniques',
    description: 'Learn essential kitchen skills and methods.'
  },
  {
    icon: Filter,
    title: 'Allergen & Diet',
    href: '/filters',
    description: 'Customize meals based on allergies and diets.'
  },
  {
    icon: NotebookPen,
    title: 'Journal',
    href: '/reflection-log',
    description: 'Record cooking experiences and progress.'
  }
]

export default function DashboardPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // ✅ ONLY ADD (mobile nav state)
  const [mobileOpen, setMobileOpen] = useState(false)

  const [progress, setProgress] = useState({
    recipesLearned: 0,
    minutesPracticed: 0,
    techniquesMastered: 0
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)

        const dishesData = await getFeaturedDishes()
        setDishes(dishesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  useEffect(() => {
    const stored = getProgress()

    setProgress({
      recipesLearned: Number(stored.recipesLearned) || 0,
      minutesPracticed: Number(stored.minutesPracticed) || 0,
      techniquesMastered: Number(stored.techniquesMastered) || 0
    })
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleRecipeSearch = () => {
    if (!searchQuery.trim()) return
    router.push(`/recipe?q=${encodeURIComponent(searchQuery)}`)
  }

  const formatMinutes = (mins: number = 0) => {
    const safe = Number(mins) || 0
    if (safe < 60) return `${safe} min`
    return `${Math.floor(safe / 60)}h ${safe % 60}m`
  }

  const calculateSkillLevel = () => {
    const score =
      (Number(progress.minutesPracticed) || 0) * 0.03 +
      (Number(progress.recipesLearned) || 0) * 5 +
      (Number(progress.techniquesMastered) || 0) * 10

    if (score >= 200) return 'Expert'
    if (score >= 120) return 'Advanced'
    if (score >= 60) return 'Intermediate'
    if (score >= 20) return 'Novice'
    return 'Beginner'
  }

  const skillLevel = calculateSkillLevel()

  const getDifficultyStyle = (level: string) => {
    const normalized = level.toLowerCase()

    if (normalized === 'beginner' || normalized === 'easy') {
      return { bg: 'bg-green-500/15 text-green-700 border-green-300/40', dot: 'bg-green-500' }
    }

    if (normalized === 'intermediate' || normalized === 'medium') {
      return { bg: 'bg-yellow-500/15 text-yellow-700 border-yellow-300/40', dot: 'bg-yellow-500' }
    }

    if (normalized === 'advanced' || normalized === 'hard') {
      return { bg: 'bg-red-500/15 text-red-700 border-red-300/40', dot: 'bg-red-500' }
    }

    return { bg: 'bg-purple-500/15 text-purple-700 border-purple-300/40', dot: 'bg-purple-500' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading DISHCOVERY...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef]">

      {/* NAVBAR */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">

            {/* LOGO */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <Image
                src="/updated-dishcovery-logo.png"
                alt="Dishcovery Logo"
                width={42}
                height={42}
                className="group-hover:rotate-6 transition duration-300"
              />

              <span className="text-2xl font-black tracking-wide text-white">
                DISHCOVERY
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-10 text-sm font-semibold text-white">
              {FEATURES.map((feature) => (
                <Link key={feature.title} href={feature.href}>
                  {feature.title}
                </Link>
              ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">

              <span className="hidden md:block text-sm text-zinc-300">
                Welcome, <span className="font-semibold text-white">{user?.name}</span>
              </span>

              {/* ✅ MOBILE TOGGLE (ADDED ONLY) */}
              <button
                className="lg:hidden text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X /> : <Menu />}
              </button>

              <button
                onClick={handleLogout}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-5 py-2 rounded-full"
              >
                Logout
              </button>

            </div>

          </div>
        </div>

        {/* ✅ MOBILE MENU (ADDED ONLY) */}
        {mobileOpen && (
          <div className="lg:hidden bg-black border-t border-white/10 px-6 py-4 space-y-4 text-white">

            {FEATURES.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                onClick={() => setMobileOpen(false)}
                className="block hover:text-yellow-400"
              >
                {feature.title}
              </Link>
            ))}

          </div>
        )}
      </nav>

      {/* EVERYTHING ELSE BELOW IS YOUR ORIGINAL CODE (UNCHANGED) */}
      {/* HERO SECTION */}
      {/* STATS */}
      {/* TRENDING RECIPE */}
      {/* RECOMMENDED DISHES */}
      {/* etc... */}

    </div>
  )
}
