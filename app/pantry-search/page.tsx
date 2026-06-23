'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

import {
  getCurrentUser,
  getAllDishes
} from '@/lib/api'

import {
  discoverRecipes,
  generateRecipeDetails,
  sendChatMessage,
  getRecipeSteps
} from '@/lib/openai'

import Link from 'next/link'
import Image from 'next/image'

import {
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  Search,
  ChefHat
} from 'lucide-react'

const COMMON_INGREDIENTS = [
  'Chicken',
  'Beef',
  'Pasta',
  'Rice',
  'Garlic',
  'Onion',
  'Tomato',
  'Mushroom',
  'Bell Pepper',
  'Basil',
  'Parmesan Cheese',
  'Olive Oil',
  'Butter',
  'Eggs',
  'Bacon',
  'Soy Sauce',
  'Lemon',
  'Salt'
]

const FOOD_IMAGES: Record<string, string> = {
  chicken: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c4?w=600',
  beef: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
  pasta: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600',
  rice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600',
  soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
  pizza: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
  curry: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600',
  fish: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600',
  salmon: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600',
  egg: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
  stir: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600',
  mushroom: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600',
  tomato: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600',
  shrimp: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600',
  pork: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600',
  sinigang: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600',
}

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'

function getFoodImage(title: string): string {
  const lower = title.toLowerCase()
  for (const [keyword, url] of Object.entries(FOOD_IMAGES)) {
    if (lower.includes(keyword)) return url
  }
  return DEFAULT_FOOD_IMAGE
}

interface Dish {
  id: number
  name: string
  description: string
  image_url: string
  difficulty_level?: string
  prep_time?: string
  cook_time?: string
  servings?: number
  category?: string
  ingredients?: string[]
  steps?: string[]
}

interface FullRecipe extends Dish {}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function PantrySearchPage() {
  const router = useRouter()

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [customIngredient, setCustomIngredient] = useState('')

  const [dishes, setDishes] = useState<Dish[]>([])
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])

  const [loading, setLoading] = useState(true)

  const [typingTimeout, setTypingTimeout] =
    useState<NodeJS.Timeout | null>(null)

  const [selectedRecipe, setSelectedRecipe] =
    useState<FullRecipe | null>(null)

  const [generatingRecipe, setGeneratingRecipe] = useState(false)

  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  const [steps, setSteps] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const [completedSteps, setCompletedSteps] =
    useState<Set<number>>(new Set())

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        await getCurrentUser()
        const dishesData = await getAllDishes(1, 100)
        setDishes(dishesData.data)
        setFilteredDishes(dishesData.data)
      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // ---------------------------------------
  // AI SEARCH
  // ---------------------------------------
  const aiSearchRecipes = async (query: string) => {
    if (!query.trim()) {
      setFilteredDishes(dishes)
      return
    }

    setIsSearching(true)

    try {
      const aiSuggestions = await discoverRecipes(query)

      const matched: Dish[] = []
      const unmatched: Dish[] = []

      aiSuggestions.forEach((recipe: any) => {
        const found = dishes.find(d =>
          d.name.toLowerCase().includes(recipe.title?.toLowerCase()) ||
          recipe.title?.toLowerCase().includes(d.name.toLowerCase())
        )
        if (found) {
          matched.push(found)
        } else {
          unmatched.push({
            id: Date.now() + Math.random(),
            name: recipe.title,
            description: recipe.description,
            image_url: getFoodImage(recipe.title),
            difficulty_level: recipe.difficulty,
            prep_time: recipe.time,
            cook_time: recipe.time,
            servings: recipe.servings,
            category: recipe.category,
          })
        }
      })

      setFilteredDishes([...matched, ...unmatched])

    } catch (err) {
      console.error('AI search failed:', err)
      filterDishes([query])
    } finally {
      setIsSearching(false)
    }
  }

  // ---------------------------------------
  // FALLBACK SEARCH
  // ---------------------------------------
  const filterDishes = (ingredients: string[]) => {
    const filtered = dishes.filter(dish =>
      ingredients.some(ing =>
        dish.name.toLowerCase().includes(ing.toLowerCase()) ||
        dish.description.toLowerCase().includes(ing.toLowerCase())
      )
    )
    setFilteredDishes(filtered)
  }

  // ---------------------------------------
  // INGREDIENT TOGGLE
  // ---------------------------------------
  const toggleIngredient = (ingredient: string) => {
    const updated = selectedIngredients.includes(ingredient)
      ? selectedIngredients.filter(i => i !== ingredient)
      : [...selectedIngredients, ingredient]

    setSelectedIngredients(updated)

    if (updated.length > 0) {
      aiSearchRecipes(updated.join(', '))
    } else {
      setFilteredDishes(dishes)
    }
  }

  // ---------------------------------------
  // CUSTOM INGREDIENT
  // ---------------------------------------
  const addCustomIngredient = () => {
    if (
      customIngredient.trim() &&
      !selectedIngredients.includes(customIngredient)
    ) {
      const updated = [...selectedIngredients, customIngredient]
      setSelectedIngredients(updated)
      aiSearchRecipes(updated.join(', '))
      setCustomIngredient('')
    }
  }

  // ---------------------------------------
  // REMOVE INGREDIENT
  // ---------------------------------------
  const removeIngredient = (ingredient: string) => {
    const updated = selectedIngredients.filter(i => i !== ingredient)
    setSelectedIngredients(updated)

    if (updated.length > 0) {
      aiSearchRecipes(updated.join(', '))
    } else {
      setFilteredDishes(dishes)
    }
  }

  // ---------------------------------------
  // OPEN RECIPE
  // ---------------------------------------
  const openRecipe = async (dish: Dish, e?: any) => {
    if (e) e.stopPropagation()
    e?.preventDefault?.()

    try {
      setGeneratingRecipe(true)

      const details = await generateRecipeDetails(dish.name, dish.description)

      const fullRecipe: FullRecipe = {
        ...dish,
        ingredients: details.ingredients || [],
        steps: details.steps || [],
      }

      const generatedSteps = await getRecipeSteps(fullRecipe)

      setSelectedRecipe(fullRecipe)
      setSteps(generatedSteps)

      setChatMessages([
        {
          role: 'assistant',
          content: `Hi, I am Dishi! Your cooking assistant for ${dish.name}. Ask me anything about cooking, ingredients, substitutions, or techniques!`
        }
      ])

    } catch (err) {
      console.error('Failed to generate recipe:', err)
      alert('Failed to generate recipe')
    } finally {
      setGeneratingRecipe(false)
    }
  }

  // ---------------------------------------
  // CHATBOT
  // ---------------------------------------
  const handleSendMessage = async () => {
    if (!userInput.trim() || isChatLoading || !selectedRecipe) return

    const userMessage: Message = { role: 'user', content: userInput }

    setChatMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsChatLoading(true)

    try {
      const recentMessages = [...chatMessages, userMessage].slice(-10)
      const response = await sendChatMessage(recentMessages, selectedRecipe)

      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: response }
      ])

    } catch (error) {
      console.error(error)
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong.' }
      ])
    } finally {
      setIsChatLoading(false)
    }
  }

  // ---------------------------------------
  // STEP TOGGLE
  // ---------------------------------------
  const toggleStepCompletion = (index: number) => {
    const updated = new Set(completedSteps)
    if (updated.has(index)) {
      updated.delete(index)
    } else {
      updated.add(index)
    }
    setCompletedSteps(updated)
  }

  // ---------------------------------------
  // SEARCH DEBOUNCE
  // ---------------------------------------
  useEffect(() => {
    if (!searchQuery.trim()) return
    const timer = setTimeout(() => {
      aiSearchRecipes(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#44624a] mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef]">

      {generatingRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <Loader2 className="w-10 h-10 animate-spin text-[#44624a] mx-auto mb-4" />
            <p className="font-bold text-gray-800">Generating your recipe...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
          </div>
        </div>
      )}

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
                ['Journal', '/reflection-log'],
              ].map(([label, href]) => {
                const isActive = label === 'Pantry'
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`
                      relative transition duration-300
                      hover:text-yellow-400
                      after:absolute after:left-0 after:-bottom-1 after:h-[2px]
                      after:w-0 after:bg-yellow-400 after:transition-all
                      hover:after:w-full
                      ${isActive ? 'text-yellow-400 after:w-full' : ''}
                    `}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>

          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="mb-12 bg-gradient-to-r from-[#44624a] to-[#5f7d65] rounded-[32px] p-10 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-10 text-[160px] leading-none">🥕</div>
          <div className="relative z-10">
            <p className="uppercase tracking-[0.3em] text-sm text-white/70 mb-3">Smart Pantry Search</p>
            <h1 className="text-5xl font-black mb-5 leading-tight">Discover Recipes From What You Have</h1>
            <p className="text-lg text-white/80 max-w-2xl">Select ingredients or let AI suggest dishes based on your pantry.</p>
          </div>
        </div>

        {/* FULL RECIPE + CHATBOT */}
        {selectedRecipe && (
          <div className="grid lg:grid-cols-3 gap-6 mb-10">

            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg p-8">

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedRecipe.name}</h2>
                    <p className="text-gray-600">{selectedRecipe.description}</p>
                  </div>
                  <button onClick={() => setSelectedRecipe(null)} className="text-gray-500 hover:text-black">✕</button>
                </div>

                <div className="flex gap-5 mb-8 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedRecipe.prep_time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedRecipe.servings} servings</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients?.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#44624a] mt-2" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4">Cooking Steps</h3>
                  {generatingRecipe ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#44624a]" />
                      <span>Generating recipe...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {steps.map((step, index) => (
                        <div
                          key={index}
                          onClick={() => { setCurrentStep(index); toggleStepCompletion(index) }}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            completedSteps.has(index)
                              ? 'bg-green-50 border-green-500'
                              : currentStep === index
                              ? 'border-[#44624a] bg-[#44624a]/5'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex gap-3">
                            {completedSteps.has(index) ? (
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400" />
                            )}
                            <div>
                              <p className="font-bold text-[#44624a]">Step {index + 1}</p>
                              <p className="text-gray-700">{step}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* CHATBOT */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg h-[700px] flex flex-col">

                <div className="border-b p-4 flex items-center gap-3">
                  <div className="bg-[#44624a] p-2 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Cooking Assistant</h3>
                    <p className="text-xs text-gray-500">Ask anything</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-lg ${
                        msg.role === 'user' ? 'bg-[#44624a] text-white' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-500" />}
                  <div ref={chatEndRef} />
                </div>

                <div className="border-t p-4 flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
                    placeholder="Ask about cooking..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button onClick={handleSendMessage} className="bg-[#44624a] text-white p-2 rounded-lg">
                    <Send className="w-5 h-5" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* PANTRY + RESULTS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur rounded-[28px] shadow-2xl border border-white/40 p-8 sticky top-28">

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#44624a] text-white flex items-center justify-center text-xl shadow-md">🧺</div>
                <div>
                  <h2 className="text-2xl font-black text-[#2f3c33] leading-tight">Your Pantry</h2>
                  <p className="text-sm text-gray-500">Add ingredients to discover recipes</p>
                </div>
              </div>

              {selectedIngredients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {selectedIngredients.map((ingredient) => (
                    <div key={ingredient} className="group flex items-center gap-2 bg-[#44624a] text-white px-3 py-1.5 rounded-full text-sm shadow-sm hover:shadow-md transition">
                      <span>{ingredient}</span>
                      <button onClick={() => removeIngredient(ingredient)} className="opacity-70 group-hover:opacity-100 hover:text-red-200 transition">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-6">
                <input
                  type="text"
                  value={customIngredient}
                  onChange={(e) => setCustomIngredient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (!customIngredient.trim()) return
                      const updated = [...selectedIngredients, customIngredient.trim()]
                      setSelectedIngredients(updated)
                      aiSearchRecipes(updated.join(', '))
                      setCustomIngredient('')
                    }
                  }}
                  placeholder="Add an ingredient..."
                  className="w-full bg-[#fcfbf8] border border-[#ece7df] rounded-2xl px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#44624a] transition"
                />
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {COMMON_INGREDIENTS.map((ing) => {
                  const isSelected = selectedIngredients.includes(ing)
                  return (
                    <button
                      key={ing}
                      onClick={() => toggleIngredient(ing)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-300 hover:-translate-y-0.5 ${
                        isSelected
                          ? 'bg-[#44624a] text-white shadow-md'
                          : 'bg-[#fcfbf8] border border-[#ece7df] hover:border-[#44624a] hover:bg-white'
                      }`}
                    >
                      {ing}
                    </button>
                  )
                })}
              </div>

            </div>
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-3">
            <div className="space-y-6">

              {isSearching ? (
                <div className="flex items-center gap-3 text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin text-[#44624a]" />
                  <span className="font-medium">Searching recipes...</span>
                </div>
              ) : filteredDishes.length === 0 ? (
                <div className="bg-white/90 backdrop-blur rounded-[28px] shadow-xl border border-white/40 p-12 text-center">
                  <div className="text-5xl mb-4">🍽️</div>
                  <h3 className="text-2xl font-black text-[#2f3c33] mb-2">No Recipes Found</h3>
                  <p className="text-gray-500">Try different ingredients or let AI suggest combinations.</p>
                </div>
              ) : (
                filteredDishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={(e) => openRecipe(dish, e)}
                    className="group cursor-pointer bg-white/90 backdrop-blur rounded-[28px] border border-[#ece7df] shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-7"
                  >

                    <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-5">
  {dish.image_url && dish.image_url.startsWith('http') ? (
    <img
      src={dish.image_url}
      alt={dish.name}
      width={600}
      height={192}
      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
        (e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-[#44624a]', 'to-[#8fbc8f]');
      }}
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-[#44624a] to-[#8fbc8f] flex items-center justify-center">
      <span className="text-6xl">🍽️</span>
    </div>
  )}
</div>

                    {!dish.image_url && (
                      <div className="h-2 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 mb-5" />
                    )}

                    <h3 className="text-2xl font-black text-[#2f3c33] group-hover:text-[#44624a] transition">{dish.name}</h3>
                    <p className="text-gray-600 mt-2 mb-5 leading-relaxed">{dish.description}</p>

                    <div className="flex flex-wrap gap-5 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#44624a]" />
                        <span>{dish.prep_time || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#44624a]" />
                        <span>{dish.servings || '—'} servings</span>
                      </div>
                    </div>

                    <div className="mt-5 text-sm text-[#44624a] font-semibold opacity-0 group-hover:opacity-100 transition">
                      Click to view recipe →
                    </div>

                  </div>
                ))
              )}

            </div>
          </div>

        </div>

      </main>
    </div>
  )
}
