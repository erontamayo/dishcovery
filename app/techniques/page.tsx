'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTechniques, getCurrentUser } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import {
  addTechniqueMastered,
  getProgress
} from '@/lib/progress'

interface Technique {
  id: number
  name: string
  description: string
  difficulty: string
  video_url?: string
  image_url?: string
}

export default function TechniquesPage() {
  const router = useRouter()
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null)
  const [filteredBy, setFilteredBy] = useState<string>('all')

  let skillLevel = 'Beginner'


  useEffect(() => {
    const loadData = async () => {
      try {
        await getCurrentUser()
        const data = await getTechniques()
        setTechniques(data)
      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const progress = getProgress()

const score =
    (Number(progress.minutesPracticed) || 0) * 0.03 +
    (Number(progress.recipesLearned) || 0) * 5 +
    (Number(progress.techniquesMastered) || 0) * 10

if (score >= 200) skillLevel = 'Expert'
else if (score >= 120) skillLevel = 'Advanced'
else if (score >= 60) skillLevel = 'Intermediate'
else if (score >= 20) skillLevel = 'Novice'

 const filteredTechniques = techniques.filter(
  (technique) => {
    if (
      skillLevel === 'Beginner' &&
      technique.difficulty !== 'beginner'
    ) {
      return false
    }

    if (
      skillLevel === 'Novice' &&
      technique.difficulty === 'advanced'
    ) {
      return false
    }

    if (
      filteredBy !== 'all' &&
      technique.difficulty !== filteredBy
    ) {
      return false
    }

    return true
  }
)

  const difficulties = ['all', ...new Set(techniques.map(t => t.difficulty))].filter(Boolean)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading techniques...</p>
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
              href="/techniques"
              className="text-yellow-400 relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-yellow-400"
            >
              Techniques
            </Link>

            <Link
              href="/filters"
              className="relative hover:text-yellow-400 transition duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-400 after:transition-all hover:after:w-full"
            >
              Allergen & Diet
            </Link>

            <Link
              href="/reflection-log"
              className="relative hover:text-yellow-400 transition duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-400 after:transition-all hover:after:w-full"
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

        <div className="absolute top-0 right-0 text-[180px] opacity-10 leading-none">
          🔪
        </div>

        <div className="relative z-10">

          <p className="uppercase tracking-[0.3em] text-sm text-white/70 mb-3">
            Culinary Skills Library
          </p>

          <h1 className="text-5xl font-black leading-tight mb-5">
            Master Essential Cooking Techniques
          </h1>

          <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
            Improve your knife skills, cooking methods, and kitchen confidence through guided culinary techniques.
          </p>

        </div>

      </div>

      {/* SKILL PROGRESS */}
      <div className="bg-white rounded-[28px] border border-[#ece7df] shadow-xl p-8 mb-10">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

          <div>

            <p className="text-sm uppercase tracking-[0.25em] text-gray-400 mb-2">
              Current Skill Level
            </p>

            <h2 className="text-4xl font-black text-[#2f3c33] mb-3">
              {skillLevel}
            </h2>

            <p className="text-gray-500 max-w-xl">
              Continue practicing recipes and mastering techniques to level up your culinary expertise.
            </p>

          </div>

          <div className="flex gap-6">

            <div className="bg-[#f8f5ef] rounded-2xl px-6 py-5 min-w-[140px]">
              <p className="text-sm text-gray-500 mb-1">
                Techniques
              </p>

              <h3 className="text-3xl font-black text-[#44624a]">
                {progress.techniquesMastered}
              </h3>
            </div>

            <div className="bg-[#f8f5ef] rounded-2xl px-6 py-5 min-w-[140px]">
              <p className="text-sm text-gray-500 mb-1">
                Recipes
              </p>

              <h3 className="text-3xl font-black text-[#44624a]">
                {progress.recipesLearned}
              </h3>
            </div>

          </div>

        </div>

      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 mb-10">

        {difficulties.map((diff) => (

          <button
            key={diff}
            onClick={() => setFilteredBy(diff)}
            className={`
              px-6 py-3
              rounded-2xl
              font-bold
              transition-all
              duration-300
              ${
                filteredBy === diff
                  ? 'bg-[#44624a] text-white shadow-lg'
                  : 'bg-white border border-[#ece7df] text-gray-700 hover:bg-[#44624a] hover:text-white'
              }
            `}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>

        ))}

      </div>

      {/* TECHNIQUES GRID */}
      {techniques.length > 0 ? (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">

          {filteredTechniques.map((technique) => (

            <button
              key={technique.id}
              onClick={() => {
                setSelectedTechnique(technique)
                addTechniqueMastered()
              }}
              className="
                group
                text-left
                bg-white
                border border-[#ece7df]
                rounded-[28px]
                overflow-hidden
                shadow-md
                hover:shadow-2xl
                hover:-translate-y-2
                transition-all
                duration-300
              "
            >

              {/* IMAGE AREA */}
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#44624a]/20 via-[#5f7d65]/10 to-white">
  {technique.image_url ? (
    <img
      src={technique.image_url}
      alt={technique.name}
      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
    />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center text-7xl group-hover:scale-110 transition duration-500">
      🔪
    </div>
  )}
  <div className="absolute top-5 left-5">
    <span
      className={`
        px-3 py-1
        rounded-full
        text-xs
        font-bold
        backdrop-blur
        ${
          technique.difficulty === 'beginner'
            ? 'bg-green-100 text-green-700'
            : technique.difficulty === 'intermediate'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }
      `}
    >
      {technique.difficulty}
    </span>
  </div>
</div>

              {/* CONTENT */}
              <div className="p-7">

                <div className="flex items-center gap-2 mb-3">

                  <div className="w-2 h-2 rounded-full bg-[#44624a]" />

                  <span className="text-sm font-semibold uppercase tracking-wide text-[#44624a]">
                    Technique
                  </span>

                </div>

                <h3 className="text-2xl font-black text-[#2f3c33] mb-3 leading-tight">
                  {technique.name}
                </h3>

                <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6">
                  {technique.description}
                </p>

                <div
                  className="
                    flex items-center justify-between
                    pt-5 border-t border-[#ece7df]
                  "
                >

                  <span className="text-sm text-gray-500">
                    Learn Technique
                  </span>

                  <div
                    className="
                      w-10 h-10
                      rounded-full
                      bg-[#44624a]
                      text-white
                      flex items-center justify-center
                      group-hover:translate-x-1
                      transition
                    "
                  >
                    →
                  </div>

                </div>

              </div>

            </button>

          ))}

        </div>

      ) : (

        <div className="bg-white rounded-[32px] border border-[#ece7df] shadow-lg p-20 text-center">

          <div className="text-7xl mb-6">
            👨‍🍳
          </div>

          <h2 className="text-3xl font-black text-[#2f3c33] mb-4">
            No Techniques Available
          </h2>

          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed text-lg">
            Techniques will appear here once they’ve been added to the culinary library.
          </p>

        </div>

      )}

      {/* MODAL */}
      {selectedTechnique && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-[32px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#ece7df]">

            {/* HERO */}
            <div className="relative h-72 bg-gradient-to-br from-[#44624a] to-[#5f7d65] overflow-hidden">

              <div className="absolute inset-0 flex items-center justify-center text-[140px] opacity-20">
                🔪
              </div>

              <button
                onClick={() => setSelectedTechnique(null)}
                className="
                  absolute top-6 right-6
                  w-12 h-12
                  rounded-full
                  bg-black/30
                  backdrop-blur
                  text-white
                  hover:bg-red-500
                  transition
                  text-2xl
                "
              >
                ×
              </button>

              <div className="absolute bottom-8 left-8 text-white">

                <p className="uppercase tracking-[0.25em] text-white/70 text-sm mb-2">
                  Cooking Technique
                </p>

                <h2 className="text-5xl font-black mb-4">
                  {selectedTechnique.name}
                </h2>

                <span
                  className={`
                    inline-block
                    px-4 py-2
                    rounded-full
                    text-sm
                    font-bold
                    ${
                      selectedTechnique.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-700'
                        : selectedTechnique.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }
                  `}
                >
                  {selectedTechnique.difficulty}
                </span>

              </div>

            </div>

            {/* CONTENT */}
            <div className="p-8">

              <div className="mb-8">

                <h3 className="text-2xl font-black text-[#2f3c33] mb-4">
                  Description
                </h3>

                <p className="text-gray-700 leading-relaxed text-lg">
                  {selectedTechnique.description}
                </p>

              </div>

              {selectedTechnique.video_url && (
  <div className="mb-8">
    <h3 className="text-2xl font-black text-[#2f3c33] mb-4">
      Video Tutorial
    </h3>

    {selectedTechnique.video_url.includes('youtube.com') ||
    selectedTechnique.video_url.includes('youtu.be') ? (
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${
            selectedTechnique.video_url.includes('youtu.be')
              ? selectedTechnique.video_url.split('youtu.be/')[1]?.split('?')[0]
              : selectedTechnique.video_url.split('v=')[1]?.split('&')[0]
          }`}
          title={selectedTechnique.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full rounded-2xl"
        />
      </div>
    ) : (
      <a
        href={selectedTechnique.video_url}
        target="_blank"
        rel="noopener noreferrer"
        className="
          inline-flex items-center gap-3
          bg-[#44624a]
          hover:bg-black
          text-white
          px-6 py-4
          rounded-2xl
          font-bold
          transition-all
          duration-300
        "
      >
        Watch Tutorial →
      </a>
    )}
  </div>
)}


              <button
                onClick={() => setSelectedTechnique(null)}
                className="
                  w-full
                  bg-gray-100
                  hover:bg-black
                  hover:text-white
                  py-4
                  rounded-2xl
                  font-bold
                  transition-all
                  duration-300
                "
              >
                Close Technique
              </button>

            </div>

          </div>

        </div>

      )}

      </main>
</div>
)
}