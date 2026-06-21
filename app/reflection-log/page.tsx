'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  getCurrentUser,
  getReflections,
  createReflection,
  deleteReflection,
} from '@/lib/api'

import Link from 'next/link'
import Image from 'next/image'

interface Reflection {
  id: number
  user_id: number
  recipe_title: string
  notes: string
  rating: number
  created_at: string
}

function ReflectionLogPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()


  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [recipeTitle, setRecipeTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(5)
  const [error, setError] = useState('')

  useEffect(() => {
  const loadData = async () => {
    try {
      await getCurrentUser()

      const reflectionsData = await getReflections()
      setReflections(reflectionsData)

    } catch (err) {
      router.push('/reflection-log')
    } finally {
      setLoading(false)
    }
  }

  loadData()
}, [router])

  const handleCreateReflection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setError('')

    if (!notes.trim()) {
      setError('Please write your reflection.')
      return
    }

    setCreating(true)

    try {
      await createReflection(recipeTitle, notes, rating)

      const updatedReflections = await getReflections()
      setReflections(updatedReflections)

      setRecipeTitle('')
      setNotes('')
      setRating(5)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create reflection'
      )
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteReflection = async (id: number) => {
    if (!confirm('Delete this reflection?')) return

    try {
      await deleteReflection(id)

      setReflections((prev) =>
        prev.filter((reflection) => reflection.id !== id)
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete reflection'
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#44624a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#44624a] text-lg font-medium">
            Loading Journal...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef]">

      {/* NAVBAR */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">

            {/* LOGO */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group"
            >
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

            {/* NAV LINKS */}
            <div className="hidden lg:flex items-center gap-10 text-sm font-semibold uppercase tracking-wide text-white">

              {[
                ['Dashboard', '/dashboard'],
                ['Recipes', '/recipe'],
                ['Pantry', '/pantry-search'],
                ['Techniques', '/techniques'],
                ['Allergen & Diet', '/filters'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="relative hover:text-yellow-400 transition duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-400 after:transition-all hover:after:w-full"
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/reflection-log"
                className="text-yellow-400 relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-yellow-400"
              >
                Journal
              </Link>

            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HERO */}
        <div className="mb-12 bg-gradient-to-r from-[#44624a] to-[#5f7d65] rounded-[32px] p-10 text-white shadow-2xl overflow-hidden relative">

          <div className="absolute top-0 right-0 opacity-10 text-[180px] leading-none">
            🍳
          </div>

          <div className="relative z-10">
            <p className="uppercase tracking-[0.3em] text-sm text-white/70 mb-3">
              Culinary Journal
            </p>

            <h1 className="text-5xl font-black mb-5 leading-tight">
              Reflect on Your Cooking Journey
            </h1>

            <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
              Document recipes, techniques, kitchen mistakes, and lessons learned as you sharpen your culinary skills.
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT SIDE */}
          <div className="lg:col-span-1">

            <div className="bg-white/90 backdrop-blur rounded-[28px] shadow-2xl border border-white/40 p-8 sticky top-28">

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#44624a] text-white flex items-center justify-center text-xl">
                  ✍️
                </div>

                <div>
                  <h2 className="text-2xl font-black text-[#2f3c33]">
                    New Reflection
                  </h2>

                  <p className="text-sm text-gray-500">
                    Capture what you learned today
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleCreateReflection}
                className="space-y-6"
              >

                {/* RECIPE */}
                <div>
                  <label className="block text-sm font-semibold text-[#2f3c33] mb-2">
                    Recipe
                  </label>

                  <input
                    type="text"
                    value={recipeTitle}
                    onChange={(e) =>
                      setRecipeTitle(e.target.value)
                    }
                    placeholder="e.g. Creamy Mushroom Pasta"
                    className="
                      w-full
                      rounded-2xl
                      border border-[#ddd7cf]
                      bg-[#fcfbf8]
                      px-4 py-3
                      text-gray-800
                      placeholder:text-gray-400
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#44624a]
                      transition
                    "
                  />
                </div>

                {/* RATING */}
                <div>
                  <label className="block text-sm font-semibold text-[#2f3c33] mb-3">
                    Experience Rating
                  </label>

                  <div className="flex gap-2 text-4xl">
                    {[1, 2, 3, 4, 5].map((star) => (
  <button
    key={star}
    type="button"
    onClick={() => setRating(star)}
    className={`transition-all duration-200 hover:scale-125 ${
      rating >= star ? 'text-yellow-400' : 'text-gray-300'
    }`}
  >
    ★
  </button>
))}
                  </div>
                </div>

                {/* NOTES */}
                <div>
                  <label className="block text-sm font-semibold text-[#2f3c33] mb-2">
                    Your Reflection
                  </label>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What techniques did you practice? What mistakes happened? What did you improve?"
                    className="
                      w-full
                      h-40
                      resize-none
                      rounded-2xl
                      border border-[#ddd7cf]
                      bg-[#fcfbf8]
                      px-4 py-4
                      text-gray-800
                      placeholder:text-gray-400
                      leading-relaxed
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#44624a]
                      transition
                    "
                  />
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={creating}
                  className="
                    w-full
                    bg-[#44624a]
                    hover:bg-black
                    text-white
                    font-bold
                    py-4
                    rounded-2xl
                    shadow-lg
                    hover:-translate-y-1
                    transition-all
                    duration-300
                  "
                >
                  {creating ? 'Saving Reflection...' : 'Save Reflection'}
                </button>

              </form>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-2">

            {reflections.length === 0 ? (

              <div className="bg-white rounded-[32px] shadow-xl border border-[#ece7df] p-16 text-center">

                <div className="text-7xl mb-6">
                  🍳
                </div>

                <h2 className="text-3xl font-black text-[#2f3c33] mb-4">
                  Start Your Culinary Journey
                </h2>

                <p className="text-gray-500 max-w-lg mx-auto leading-relaxed text-lg">
                  Every recipe teaches something new. Start documenting your cooking experiences and build your own chef story.
                </p>

              </div>

            ) : (

              <div className="space-y-6">

                {reflections.map((reflection) => (

                  <div
                    key={reflection.id}
                    className="
                      group
                      bg-white
                      rounded-[28px]
                      p-7
                      border border-[#ece7df]
                      shadow-md
                      hover:shadow-2xl
                      hover:-translate-y-1
                      transition-all
                      duration-300
                    "
                  >

                    {/* TOP BAR */}
                    <div className="h-2 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 mb-6" />

                    <div className="flex justify-between items-start mb-5">

                      <div>
                        <h3 className="text-2xl font-black text-[#2f3c33] tracking-tight">
                          {reflection.recipe_title}
                        </h3>

                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(
                            reflection.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleDeleteReflection(reflection.id)
                        }
                        className="
                          w-10 h-10
                          rounded-full
                          bg-red-50
                          text-red-400
                          hover:bg-red-500
                          hover:text-white
                          transition
                          flex
                          items-center
                          justify-center
                          text-xl
                        "
                      >
                        ×
                      </button>

                    </div>

                    {/* STARS */}
                    <div className="flex gap-1 text-2xl mb-5">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < reflection.rating
                              ? 'text-yellow-400'
                              : 'text-gray-200'
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {/* NOTES */}
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                      {reflection.notes}
                    </p>

                  </div>
                ))}

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ReflectionLogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ReflectionLogPageContent />
    </Suspense>
  )
}