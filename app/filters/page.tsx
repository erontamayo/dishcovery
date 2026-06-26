'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/api'
import { discoverRecipes, generateRecipeDetails, getRecipeSteps, sendChatMessage } from '@/lib/openai'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, CheckCircle2, Circle, Loader2, ChefHat, MessageCircle, Send } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface Dish {
  id: string
  title: string
  description: string
  image_url: string
  difficulty: string
  time: string
  servings: number
  category: string
}

interface FullRecipe extends Dish {
  ingredients: string[]
  steps: string[]
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'glutenfree', label: 'Gluten-Free', icon: '🌾' },
  { id: 'dairyfree', label: 'Dairy-Free', icon: '🥛' }
]

const ALLERGENS = [
  'Eggs', 'Dairy', 'Nuts', 'Soy', 'Gluten', 'Shellfish', 'Fish', 'Alcohol'
]

export default function FiltersPage() {
  const router = useRouter()

  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [avoidAllergens, setAvoidAllergens] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAISearching, setIsAISearching] = useState(false)

  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null)
  const [generatingRecipe, setGeneratingRecipe] = useState(false)
  const [steps, setSteps] = useState<string[]>([])
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        await getCurrentUser()
      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  useEffect(() => {
    const runSearch = async () => {
      if (!searchQuery.trim() && selectedDietary.length === 0 && avoidAllergens.length === 0) {
        setFilteredDishes([])
        return
      }
      setIsAISearching(true)
      try {
        const query = `
  ${searchQuery ? `Find recipes for: ${searchQuery}` : 'Suggest recipes'}
  Dietary preferences: ${selectedDietary.length ? selectedDietary.join(', ') : 'none'}
  Avoid allergens: ${avoidAllergens.length ? avoidAllergens.join(', ') : 'none'}
`
        const aiResults = await discoverRecipes(query)
        setFilteredDishes(aiResults)
      } catch (err) {
        console.error('AI search failed:', err)
        setFilteredDishes([])
      } finally {
        setIsAISearching(false)
      }
    }
    const timer = setTimeout(runSearch, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedDietary, avoidAllergens])

  const openRecipe = async (dish: Dish) => {
    try {
      setGeneratingRecipe(true)
      setSelectedRecipe(null)
      setSteps([])
      setCompletedSteps(new Set())
      setCurrentStep(0)
      const details = await generateRecipeDetails(dish.title, dish.description)
      const full: FullRecipe = {
        ...dish,
        ingredients: details.ingredients || [],
        steps: details.steps || []
      }
      setSelectedRecipe(full)
      const generatedSteps = await getRecipeSteps(full)
      setSteps(generatedSteps)
    } catch (err) {
      console.error('Failed to load recipe:', err)
    } finally {
      setGeneratingRecipe(false)
    }
  }

  const toggleStepCompletion = (index: number) => {
    const updated = new Set(completedSteps)
    if (updated.has(index)) {
      updated.delete(index)
    } else {
      updated.add(index)
    }
    setCompletedSteps(updated)
  }

  const toggleDietary = (dietary: string) => {
    setSelectedDietary(prev =>
      prev.includes(dietary) ? prev.filter(d => d !== dietary) : [...prev, dietary]
    )
  }

  const toggleAllergen = (allergen: string) => {
    setAvoidAllergens(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    )
  }

  const clearFilters = () => {
    setSelectedDietary([])
    setAvoidAllergens([])
    setSearchQuery('')
    setFilteredDishes([])
    setSelectedRecipe(null)
  }

  const difficultyColors: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading Allergen and Diet...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef]">

      <Navbar activePage="Allergen & Diet" />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HERO */}
        <div className="mb-10 bg-gradient-to-r from-[#44624a] to-[#5f7d65] rounded-[32px] p-10 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute right-0 top-0 text-[200px] opacity-10 leading-none">🥗</div>
          <div className="relative z-10">
            <p className="uppercase tracking-[0.3em] text-sm text-white/70 mb-3">Smart Food Discovery</p>
            <h1 className="text-5xl font-black leading-tight mb-5">Personalized Recipes For Every Diet</h1>
            <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
              Discover AI-powered recipes tailored to your dietary preferences, allergens, and cravings.
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-[28px] p-5 shadow-xl border border-[#ece7df] mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes, ingredients, cuisines..."
                className="w-full rounded-2xl border border-[#ddd7cf] bg-[#fcfbf8] px-5 py-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#44624a] transition"
              />
            </div>
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  setIsAISearching(true)
                  discoverRecipes(searchQuery)
                    .then(setFilteredDishes)
                    .finally(() => setIsAISearching(false))
                }
              }}
              className="bg-[#44624a] hover:bg-black text-white px-8 rounded-2xl font-bold shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              Search Recipes
            </button>
          </div>
        </div>

        {/* ACTIVE FILTERS */}
        {(searchQuery || selectedDietary.length > 0 || avoidAllergens.length > 0) && (
          <div className="bg-white rounded-[24px] p-5 shadow-md border border-[#ece7df] mb-8">
            <p className="text-sm font-semibold text-gray-500 mb-4">Active Filters</p>
            <div className="flex flex-wrap gap-3">
              {searchQuery && (
                <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">🔍 {searchQuery}</span>
              )}
              {selectedDietary.map((d) => {
                const option = DIETARY_OPTIONS.find((o) => o.id === d)
                return (
                  <span key={d} className="px-4 py-2 rounded-full bg-[#44624a]/10 text-[#44624a] text-sm font-medium">
                    {option?.icon} {option?.label}
                  </span>
                )
              })}
              {avoidAllergens.map((a) => (
                <span key={a} className="px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-medium">🚫 {a}</span>
              ))}
            </div>
          </div>
        )}

        {/* FULL RECIPE MODAL */}
        {(selectedRecipe || generatingRecipe) && (
          <div className="mb-10 bg-white rounded-[32px] shadow-2xl border border-[#ece7df] overflow-hidden">
            {generatingRecipe ? (
              <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#44624a] mb-5" />
                <p className="text-lg font-medium text-gray-600">Generating your personalized recipe...</p>
              </div>
            ) : selectedRecipe && (
              <div>
                {selectedRecipe.image_url && (
                  <div className="relative h-[350px] overflow-hidden">
                    <img src={selectedRecipe.image_url} alt={selectedRecipe.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white">
                      <h2 className="text-5xl font-black mb-3">{selectedRecipe.title}</h2>
                      <p className="text-white/80 max-w-2xl">{selectedRecipe.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedRecipe(null)}
                      className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/40 backdrop-blur text-white hover:bg-red-500 transition text-xl"
                    >✕</button>
                  </div>
                )}

                <div className="p-8">
                  <div className="flex flex-wrap gap-4 mb-10">
                    <div className="bg-[#f8f5ef] px-4 py-3 rounded-2xl flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#44624a]" />
                      <span className="font-medium">{selectedRecipe.time}</span>
                    </div>
                    <div className="bg-[#f8f5ef] px-4 py-3 rounded-2xl flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#44624a]" />
                      <span className="font-medium">{selectedRecipe.servings} servings</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl font-bold text-sm ${difficultyColors[selectedRecipe.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                      {selectedRecipe.difficulty}
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-10">
                    <div>
                      <h3 className="text-3xl font-black text-[#2f3c33] mb-6">Ingredients</h3>
                      <div className="space-y-3">
                        {selectedRecipe.ingredients.map((ing, i) => (
                          <div key={i} className="flex items-start gap-3 bg-[#fcfbf8] rounded-2xl p-4 border border-[#ece7df]">
                            <div className="w-3 h-3 rounded-full bg-[#44624a] mt-2" />
                            <span className="text-gray-700 leading-relaxed">{ing}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-3xl font-black text-[#2f3c33] mb-6">Cooking Steps</h3>
                      {steps.length === 0 ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin text-[#44624a]" />
                          <span className="text-gray-500">Generating steps...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {steps.map((step, index) => (
                            <div
                              key={index}
                              onClick={() => { setCurrentStep(index); toggleStepCompletion(index) }}
                              className={`flex gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                completedSteps.has(index) ? 'bg-green-50 border-green-500'
                                : currentStep === index ? 'bg-[#44624a]/5 border-[#44624a]'
                                : 'bg-white border-[#ece7df]'
                              }`}
                            >
                              {completedSteps.has(index) ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                              )}
                              <div>
                                <p className="font-black text-[#44624a] mb-1">Step {index + 1}</p>
                                <p className={`leading-relaxed ${completedSteps.has(index) ? 'line-through text-gray-400' : 'text-gray-700'}`}>{step}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[28px] shadow-xl border border-[#ece7df] p-7 sticky top-28">

              <div className="mb-8">
                <h3 className="text-2xl font-black text-[#2f3c33] mb-5">Dietary Preferences</h3>
                <div className="space-y-4">
                  {DIETARY_OPTIONS.map((option) => (
                    <label key={option.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#f8f5ef] cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={selectedDietary.includes(option.id)}
                        onChange={() => toggleDietary(option.id)}
                        className="w-5 h-5 accent-[#44624a]"
                      />
                      <span className="text-3xl">{option.icon}</span>
                      <span className="font-medium text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#ece7df] pt-8">
                <h3 className="text-2xl font-black text-[#2f3c33] mb-5">Avoid Allergens</h3>
                <div className="space-y-3">
                  {ALLERGENS.map((allergen) => (
                    <label key={allergen} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={avoidAllergens.includes(allergen)}
                        onChange={() => toggleAllergen(allergen)}
                        className="w-5 h-5 accent-red-500"
                      />
                      <span className="text-gray-700 font-medium">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(searchQuery || selectedDietary.length > 0 || avoidAllergens.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="mt-8 w-full bg-gray-100 hover:bg-black hover:text-white py-3 rounded-2xl font-bold transition-all duration-300"
                >
                  Clear All Filters
                </button>
              )}

            </div>
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-3">
            {isAISearching && (
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-5 h-5 animate-spin text-[#44624a]" />
                <span className="text-gray-500">Dishi is searching for recipes...</span>
              </div>
            )}

            {filteredDishes.length === 0 && !isAISearching ? (
              <div className="bg-white rounded-[32px] shadow-lg border border-[#ece7df] p-20 text-center">
                <div className="text-7xl mb-6">🍽️</div>
                <h2 className="text-3xl font-black text-[#2f3c33] mb-4">Discover Your Perfect Meal</h2>
                <p className="text-gray-500 max-w-lg mx-auto leading-relaxed text-lg">
                  Search recipes or apply filters to discover dishes tailored to your dietary needs.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {filteredDishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => openRecipe(dish)}
                    className="group bg-white rounded-[28px] overflow-hidden border border-[#ece7df] shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-60 overflow-hidden">
                      {dish.image_url ? (
                        <img src={dish.image_url} alt={dish.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full bg-[#f8f5ef] flex items-center justify-center">
                          <ChefHat className="w-16 h-16 text-[#44624a]/40" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur ${difficultyColors[dish.difficulty] || 'bg-white/90 text-gray-700'}`}>
                          {dish.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-[#44624a]" />
                        <span className="text-sm text-[#44624a] font-semibold uppercase tracking-wide">{dish.category}</span>
                      </div>
                      <h3 className="text-2xl font-black text-[#2f3c33] mb-3 leading-tight">{dish.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-5 line-clamp-2">{dish.description}</p>
                      <div className="flex gap-5 text-sm text-gray-500 mb-5">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{dish.time}</span></div>
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{dish.servings} servings</span></div>
                      </div>
                      <button className="w-full bg-[#44624a] hover:bg-black text-white py-3 rounded-2xl font-bold transition-all duration-300">
                        View Full Recipe
                      </button>
                    </div>
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
