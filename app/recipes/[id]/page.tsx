'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getDishById } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import {
  Clock3,
  Users,
  ChefHat,
  Flame,
  Star,
  Loader2
} from 'lucide-react'

interface Ingredient {
  name: string
  amount: number | string
  unit: string
}

interface Dish {
  id: number
  name: string
  description: string
  image_url: string
  difficulty_level: string
  prep_time: number
  cook_time: number
  servings: number
  recipe: {
    id: number
    ingredients_json: string
    instructions: string
    techniques_used: string
    allergens: string
    dietary_info: string
    nutrition_info: string
  }
}

export default function RecipePage() {
  const router = useRouter()
  const pathname = usePathname()
  const id = pathname.split('/').pop()

  const [dish, setDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [instructions, setInstructions] = useState<string[]>([])

  useEffect(() => {
    const loadDish = async () => {
      try {
        const data = await getDishById(Number(id))
        setDish(data)

        if (data.recipe) {
          try {
            // mysql2 auto-parses JSON columns into objects, so handle both string and object
            const raw = data.recipe.ingredients_json
            setIngredients(
              Array.isArray(raw) ? raw
              : typeof raw === 'string' ? JSON.parse(raw || '[]')
              : []
            )
            const rawInstructions = data.recipe.instructions || ''
            setInstructions(
              rawInstructions
                .split('\n')
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0)
            )
          } catch (e) {
            console.error('Error parsing recipe data:', e)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipe')
      } finally {
        setLoading(false)
      }
    }

    if (id) loadDish()
  }, [id])

  const difficultyStyles: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700',
    Easy: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
    Hard: 'bg-red-100 text-red-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#44624a] animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (error || !dish) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || 'Recipe not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#44624a] hover:bg-[#2f3c33] text-white font-semibold py-2 px-6 rounded-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const totalTime = dish.prep_time + dish.cook_time

  return (
    <div className="min-h-screen bg-[#f8f5ef] overflow-hidden">

      {/* NAVBAR */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">

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

            <div className="hidden lg:flex items-center gap-10 text-sm font-semibold uppercase tracking-wide text-white">
              {[
                ['Dashboard', '/dashboard'],
                ['Recipes', '/recipe'],
                ['Pantry', '/pantry-search'],
                ['Techniques', '/techniques'],
                ['Allergen & Diet', '/filters'],
                ['Journal', '/reflection-log']
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="relative hover:text-yellow-400 transition duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-400 after:transition-all hover:after:w-full"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-[720px] overflow-hidden">

        {dish.image_url ? (
          <Image
            src={dish.image_url}
            alt={dish.name}
            fill
            priority
            className="object-cover scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-9xl">🍽️</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/30 to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/10 blur-3xl rounded-full" />

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-20 w-full text-white">

            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm mb-6 backdrop-blur-xl border border-white/10 ${difficultyStyles[dish.difficulty_level] || 'bg-white text-black'}`}>
              <ChefHat className="w-4 h-4" />
              {dish.difficulty_level}
            </div>

            <h1 className="text-6xl lg:text-8xl font-black leading-[0.95] mb-6 max-w-5xl">
              {dish.name}
            </h1>

            <p className="text-xl text-white/80 max-w-3xl leading-relaxed mb-10">
              {dish.description}
            </p>

            <div className="flex flex-wrap gap-5">

              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl px-6 py-5 min-w-[180px]">
                <div className="flex items-center gap-3 mb-2">
                  <Clock3 className="w-5 h-5 text-yellow-400" />
                  <p className="text-white/70 text-sm uppercase tracking-wide">Total Time</p>
                </div>
                <p className="text-3xl font-black">{totalTime}m</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl px-6 py-5 min-w-[180px]">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <p className="text-white/70 text-sm uppercase tracking-wide">Servings</p>
                </div>
                <p className="text-3xl font-black">{dish.servings}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl px-6 py-5 min-w-[180px]">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-5 h-5 text-yellow-400" />
                  <p className="text-white/70 text-sm uppercase tracking-wide">Prep Time</p>
                </div>
                <p className="text-3xl font-black">{dish.prep_time}m</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-[360px_1fr] gap-10">

          {/* INGREDIENTS */}
          <aside className="sticky top-28 h-fit bg-white/90 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#44624a] text-white flex items-center justify-center text-2xl">
                🥬
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#2f3c33]">Ingredients</h2>
                <p className="text-gray-500 text-sm">Everything you need</p>
              </div>
            </div>

            <ul className="space-y-4">
              {ingredients.length > 0 ? (
                ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 bg-[#faf8f4] border border-[#ece7df] rounded-2xl px-4 py-4 hover:shadow-md transition"
                  >
                    <div className="w-3 h-3 rounded-full bg-[#44624a] mt-2" />
                    <span className="text-gray-700 leading-relaxed">
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No ingredients listed</p>
              )}
            </ul>
          </aside>

          {/* INSTRUCTIONS */}
          <section className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[36px] p-8 lg:p-12 shadow-2xl">
            <div className="flex items-center justify-between mb-12">
              <div>
                <p className="uppercase tracking-[0.3em] text-sm text-[#44624a] mb-3">
                  Step-by-Step Guide
                </p>
                <h2 className="text-5xl font-black text-[#2f3c33]">
                  Cooking Instructions
                </h2>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400" />
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {instructions.length > 0 ? (
                instructions.map((step, index) => (
                  <div
                    key={index}
                    className="group relative bg-[#fcfbf8] border border-[#ece7df] rounded-[28px] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#44624a] text-white flex items-center justify-center text-xl font-black shadow-lg">
                        {index + 1}
                      </div>
                      <div className="pt-2">
                        <h3 className="text-xl font-bold text-[#2f3c33] mb-2">
                          Step {index + 1}
                        </h3>
                        <p className="text-gray-700 text-lg leading-relaxed">
                          {step}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No instructions available</p>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
