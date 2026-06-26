'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getFeaturedDishes, logout } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  Clock,
  Menu,
  X,
  Users,
  TrendingUp,
  Award,
  Book,
  ShoppingCart,
  Scissors,
  Filter,
  NotebookPen,
  BookOpen,
  Flame
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleRecipeSearch = () => {
  if (!searchQuery.trim()) return

  router.push(`/recipe?q=${encodeURIComponent(searchQuery)}`)
}

interface UserProgress {
  recipesLearned: number
  hoursPracticed: number
  techniquesMastered: number
}

const [progress, setProgress] = useState({
  recipesLearned: 0,
  minutesPracticed: 0,
  techniquesMastered: 0
})

useEffect(() => {
  const stored = getProgress()

  setProgress({
    recipesLearned: Number(stored.recipesLearned) || 0,
    minutesPracticed: Number(stored.minutesPracticed) || 0,
    techniquesMastered: Number(stored.techniquesMastered) || 0
  })
}, [])

const formatMinutes = (mins: number = 0) => {
  const safe = Number(mins) || 0

  if (safe < 60) return `${safe} min`

  const hours = Math.floor(safe / 60)
  const remaining = safe % 60

  return `${hours}h ${remaining}m`
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

const stats = [
  {
    label: 'Recipes Learned',
    value: progress.recipesLearned,
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    label: 'Minutes Practiced',
    value: formatMinutes(progress.minutesPracticed || 0),
    icon: Clock,
    color: 'bg-green-500'
  },
  {
    label: 'Techniques Mastered',
    value: progress.techniquesMastered,
    icon: Award,
    color: 'bg-orange-500'
  },
  {
    label: 'Skill Level',
    value: skillLevel,
    icon: TrendingUp,
    color: 'bg-purple-500'
  }
]

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700',
  Novice: 'bg-blue-100 text-blue-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-red-100 text-red-700',
  Expert: 'bg-purple-100 text-purple-700',

  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700'
}

const getDifficultyStyle = (level: string) => {
  const normalized = level.toLowerCase()

  if (
    normalized === 'beginner' ||
    normalized === 'easy'
  ) {
    return {
      bg: 'bg-green-500/15 text-green-700 border-green-300/40',
      dot: 'bg-green-500'
    }
  }

  if (
    normalized === 'intermediate' ||
    normalized === 'medium'
  ) {
    return {
      bg: 'bg-yellow-500/15 text-yellow-700 border-yellow-300/40',
      dot: 'bg-yellow-500'
    }
  }

  if (
    normalized === 'advanced' ||
    normalized === 'hard'
  ) {
    return {
      bg: 'bg-red-500/15 text-red-700 border-red-300/40',
      dot: 'bg-red-500'
    }
  }

  return {
    bg: 'bg-purple-500/15 text-purple-700 border-purple-300/40',
    dot: 'bg-purple-500'
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading DISHCOVERY...</p>
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

      {/* NAV LINKS - DESKTOP */}
      <div className="hidden lg:flex items-center gap-10 text-sm font-semibold uppercase tracking-wide text-white">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="relative group">
            <Link
              href={feature.href}
              className="relative hover:text-yellow-400 transition duration-300
              after:absolute after:left-0 after:-bottom-1 after:h-[2px]
              after:w-0 after:bg-yellow-400 after:transition-all
              hover:after:w-full"
            >
              {feature.title}
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 top-10
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-300 bg-[#1f1f1f] text-white text-xs
              px-4 py-2 rounded-lg shadow-xl whitespace-nowrap z-50">
              {feature.description}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        <span className="hidden md:block text-sm text-zinc-300">
          Welcome,{" "}
          <span className="font-semibold text-white">{user?.name}</span>
        </span>

        <button
          onClick={handleLogout}
          className="hidden lg:block bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-5 py-2 rounded-full transition"
        >
          Logout
        </button>

        {/* HAMBURGER - MOBILE ONLY */}
        <button
          className="lg:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

    </div>
  </div>

  {/* MOBILE MENU DRAWER */}
  {mobileMenuOpen && (
    <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-md">

      {/* DRAWER HEADER */}
      <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
        <span className="text-white font-black text-lg">MENU</span>
        <button onClick={() => setMobileMenuOpen(false)} className="text-white">
          <X size={28} />
        </button>
      </div>

      {/* WELCOME */}
      <div className="px-6 pt-6">
        <p className="text-white/60 text-sm">Welcome back,</p>
        <p className="text-white font-black text-xl">{user?.name}</p>
      </div>

      {/* FEATURE LINKS */}
      <div className="px-6 py-8 space-y-6">
        {FEATURES.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.title}
              href={feature.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-start gap-4 text-white"
            >
              <div className="bg-white/10 p-3 rounded-xl">
                <Icon className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="font-bold text-lg">{feature.title}</p>
                <p className="text-sm text-white/60">{feature.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* LOGOUT BUTTON */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl"
        >
          Logout
        </button>
      </div>

    </div>
  )}
</nav>

      {/* HERO SECTION */}
{/* HERO SECTION */}
<section className="relative overflow-hidden min-h-[550px]">

  {/* BACKGROUND IMAGE (FULL COVER + 50% OPACITY) */}
  <img
    src="/dashboard.png"
    alt="Food background"
    className="absolute inset-0 w-full h-full object-cover opacity-40"
  />

  {/* DARK GREEN OVERLAY (keeps text readable) */}
  <div className="absolute inset-0 bg-[#44624a]/80" />

  {/* CONTENT */}
  <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-12 py-20 text-white">

    <p className="uppercase tracking-[0.3em] text-yellow-300 text-sm mb-4">
      Cooking Made Smarter with Dishcovery
    </p>

    <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
      Learn.
      <br />
      Cook.
      <br />
      Master.
    </h1>

    <p className="text-lg text-white/80 max-w-xl mb-10">
      Your comprehensive platform for recipes, kitchen techniques,
      pantry discovery, and culinary growth designed for BSHM students.
    </p>

    {/* SEARCH BAR */}
    <div className="bg-white rounded-full p-2 flex items-center max-w-xl shadow-2xl">
      <Search className="w-5 h-5 text-gray-500 ml-4" />

      <input
        type="text"
        placeholder="Search recipes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleRecipeSearch()
        }}
        className="flex-1 px-4 py-3 outline-none text-gray-800 bg-transparent"
      />

      <button
        onClick={handleRecipeSearch}
        className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-full transition"
      >
        Search
      </button>
    </div>

  </div>
</section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 mb-20">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

          {stats.map((stat, index) => {
            const Icon = stat.icon

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">

                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <span className="text-3xl font-black text-gray-900">
                    {stat.value}
                  </span>
                </div>

                <p className="text-gray-600 font-medium">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 pb-20">

        {/* TRENDING RECIPE */}
        {dishes.length > 0 && (
          <section className="mb-20">

            <div className="flex items-center gap-3 mb-8">
              <Flame className="w-7 h-7 text-orange-500" />

              <h2 className="text-4xl font-black text-gray-900">
                Trending Recipe
              </h2>
            </div>

            <Link href={`/recipes/${dishes[0].id}`}>

              <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">

                <div className="grid lg:grid-cols-2">

                  {/* IMAGE */}
                  <div className="relative overflow-hidden">

                    {dishes[0].image_url ? (
                      <Image
                        src={dishes[0].image_url}
                        alt={dishes[0].name}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover min-h-[450px] group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full min-h-[450px] bg-gray-200 flex items-center justify-center">
                        <span className="text-7xl">🍽️</span>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-10 flex flex-col justify-center">

                    {(() => {
  const difficulty = getDifficultyStyle(
    dishes[0].difficulty_level
  )

  return (
    <div
      className={`
        w-fit
        inline-flex
        items-center
        gap-2
        px-5
        py-2.5
        rounded-full
        text-sm
        font-black
        tracking-wide
        mb-6
        backdrop-blur-xl
        border
        shadow-sm
        ${difficulty.bg}
      `}
    >
      <div
        className={`
          w-2.5
          h-2.5
          rounded-full
          ${difficulty.dot}
        `}
      />

      {dishes[0].difficulty_level}
    </div>
  )
})()}

                    <h3 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
                      {dishes[0].name}
                    </h3>

                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                      {dishes[0].description}
                    </p>

                    <div className="flex items-center gap-8 mb-10 text-gray-600">

                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />

                        <span className="font-medium">
                          {dishes[0].prep_time + dishes[0].cook_time} mins
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />

                        <span className="font-medium">
                          4 servings
                        </span>
                      </div>
                    </div>

                    <button className="w-fit bg-[#44624a] hover:bg-[#2f4234] text-white px-10 py-4 rounded-full font-bold transition">
                      Start Learning
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* RECOMMENDED RECIPES */}
        <section>

          <div className="flex items-center justify-between mb-10">

            <h2 className="text-4xl font-black text-gray-900">
              Recommended Dishes
            </h2>

            <Link
              href="/recipe"
              className="text-[#44624a] font-bold hover:underline"
            >
              Search more
            </Link>
          </div>

          {dishes.length > 0 ? (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

              {dishes.map((dish) => {

  const difficulty = getDifficultyStyle(
    dish.difficulty_level
  )

  return (

                <Link key={dish.id} href={`/recipes/${dish.id}`}>

                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">

                    {/* IMAGE */}
                    <div className="relative h-60 overflow-hidden">

                      {dish.image_url ? (
                        <Image
                          src={dish.image_url}
                          alt={dish.name}
                          width={500}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-6xl">🍽️</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                    </div>

                    {/* CONTENT */}
                    <div className="p-6">

                      <div
  className={`
    inline-flex
    items-center
    gap-2
    px-4
    py-2
    rounded-full
    text-xs
    font-black
    tracking-wide
    mb-4
    backdrop-blur-xl
    border
    shadow-sm
    ${difficulty.bg}
  `}
>
  <div
    className={`
      w-2
      h-2
      rounded-full
      ${difficulty.dot}
    `}
  />

  {dish.difficulty_level}
</div>

                      <h3 className="text-2xl font-black text-gray-900 mb-3">
                        {dish.name}
                      </h3>

                      <p className="text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-600">

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />

                          <span>
                            {dish.prep_time + dish.cook_time} mins
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />

                          <span>4 servings</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
})}
            </div>

          ) : (

            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
              <p className="text-gray-500 text-lg">
                No dishes available yet.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
