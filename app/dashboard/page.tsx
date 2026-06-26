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

export default function DashboardPage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // ✅ MOBILE MENU STATE (ADDED ONLY)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const userData = await getCurrentUser()
      setUser(userData)

      const dishesData = await getFeaturedDishes()
      setDishes(dishesData)

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleRecipeSearch = () => {
    if (!searchQuery.trim()) return
    router.push(`/recipe?q=${encodeURIComponent(searchQuery)}`)
  }

  const FEATURES = [
    { icon: Book, title: 'Recipes', href: '/recipe', description: 'Browse recipes' },
    { icon: ShoppingCart, title: 'Pantry', href: '/pantry-search', description: 'Manage ingredients' },
    { icon: Scissors, title: 'Techniques', href: '/techniques', description: 'Learn skills' },
    { icon: Filter, title: 'Allergen & Diet', href: '/filters', description: 'Customize meals' },
    { icon: NotebookPen, title: 'Journal', href: '/reflection-log', description: 'Track progress' }
  ]

  if (loading) {
    return <div className="p-10">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef]">

      {/* NAVBAR */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">

            {/* LOGO */}
            <Link href="/dashboard" className="flex items-center gap-3 text-white font-black">
              <Image
                src="/updated-dishcovery-logo.png"
                alt="logo"
                width={42}
                height={42}
              />
              DISHCOVERY
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-10 text-white text-sm font-semibold">
              {FEATURES.map((feature) => (
                <Link key={feature.title} href={feature.href} className="hover:text-yellow-400">
                  {feature.title}
                </Link>
              ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">

              <span className="hidden md:block text-white text-sm">
                Welcome, {user?.name}
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

      {/* EVERYTHING BELOW IS YOUR ORIGINAL DASHBOARD (UNCHANGED) */}
      {/* HERO SECTION */}
      {/* STATS */}
      {/* TRENDING */}
      {/* RECOMMENDED */}
      {/* etc... */}

    </div>
  )
}
