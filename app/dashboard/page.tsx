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
  { icon: Book, title: 'Recipes', href: '/recipe', description: 'Browse personalized recipes and cooking ideas.' },
  { icon: ShoppingCart, title: 'Pantry', href: '/pantry-search', description: 'Track and manage your available ingredients.' },
  { icon: Scissors, title: 'Techniques', href: '/techniques', description: 'Learn essential kitchen skills and methods.' },
  { icon: Filter, title: 'Allergen & Diet', href: '/filters', description: 'Customize meals based on allergies and diets.' },
  { icon: NotebookPen, title: 'Journal', href: '/reflection-log', description: 'Record cooking experiences and progress.' }
]

export default function DashboardPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
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
    if (mins < 60) return `${mins} min`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const calculateSkillLevel = () => {
    const score =
      (progress.minutesPracticed || 0) * 0.03 +
      (progress.recipesLearned || 0) * 5 +
      (progress.techniquesMastered || 0) * 10

    if (score >= 200) return 'Expert'
    if (score >= 120) return 'Advanced'
    if (score >= 60) return 'Intermediate'
    if (score >= 20) return 'Novice'
    return 'Beginner'
  }

  const skillLevel = calculateSkillLevel()

  const getDifficultyStyle = (level: string) => {
    const n = level.toLowerCase()

    if (n === 'beginner' || n === 'easy')
      return { bg: 'bg-green-500/15 text-green-700 border-green-300/40', dot: 'bg-green-500' }

    if (n === 'intermediate' || n === 'medium')
      return { bg: 'bg-yellow-500/15 text-yellow-700 border-yellow-300/40', dot: 'bg-yellow-500' }

    if (n === 'advanced' || n === 'hard')
      return { bg: 'bg-red-500/15 text-red-700 border-red-300/40', dot: 'bg-red-500' }

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
      <nav className="bg-black/90 sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <Link href="/dashboard" className="flex items-center gap-3 text-white font-bold">
            <Image src="/updated-dishcovery-logo.png" alt="logo" width={40} height={40} />
            DISHCOVERY
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex gap-8 text-white text-sm font-semibold">
            {FEATURES.map(f => (
              <Link key={f.title} href={f.href} className="hover:text-yellow-400">
                {f.title}
              </Link>
            ))}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            <span className="hidden md:block text-white text-sm">
              Hi, {user?.name}
            </span>

            {/* MOBILE BUTTON */}
            <button
              className="lg:hidden text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>

            <button
              onClick={handleLogout}
              className="bg-yellow-400 px-4 py-2 rounded-full font-bold"
            >
              Logout
            </button>
          </div>

        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="lg:hidden bg-black text-white px-6 py-4 space-y-3 border-t border-white/10">
            {FEATURES.map(f => (
              <Link
                key={f.title}
                href={f.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 hover:text-yellow-400"
              >
                {f.title}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-[500px]">
        <img src="/dashboard.png" className="absolute w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-green-900/70" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-white">
          <h1 className="text-5xl font-black">Learn. Cook. Master.</h1>

          <div className="mt-8 flex bg-white rounded-full overflow-hidden max-w-xl">
            <input
              className="flex-1 px-4 text-black"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRecipeSearch()}
            />
            <button onClick={handleRecipeSearch} className="bg-yellow-400 px-6">
              Search
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
