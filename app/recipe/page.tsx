'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { ArrowLeft, MessageCircle, ChefHat, Clock, Users, Send, Loader2, CheckCircle2, Circle, Search } from 'lucide-react'
import { sendChatMessage, getRecipeSteps, discoverRecipes, generateRecipeDetails } from '@/lib/openai'

import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  addRecipeLearned,
  addPracticeMinutes
} from '@/lib/progress'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface Recipe {
  id: number
  name: string
  description: string
  image_url: string
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  prep_time?: string
  cook_time?: string
  servings?: number
  category?: string
  ingredients?: string[]
  steps?: string[]
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RecipePageProps {
  onBack: () => void
}

function RecipePageContent() {
  const searchParams = useSearchParams()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [steps, setSteps] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const chatEndRef = useRef<HTMLDivElement>(null)
  const recipeStartTime = useRef<number | null>(null)
  const pathname = usePathname()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const resultsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (searchResults.length > 0) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchResults])

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) setSearchQuery(query)
  }, [searchParams])

  useEffect(() => {
    const query = searchParams.get('q')
    if (query && query.trim().length >= 2) handleSearchFromQuery(query)
  }, [searchParams])

  const handleSearchFromQuery = async (query: string) => {
    if (isSearching) return
    setIsSearching(true)
    setSearchResults([])
    try {
      const aiSuggestions = await discoverRecipes(query)
      const enrichedResults = await Promise.all(
        aiSuggestions.map(async (r) => ({ ...r, image_url: r.image_url || null }))
      )
      setSearchResults(enrichedResults)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    async function loadSteps() {
      if (!recipe) return
      try {
        const generatedSteps = await getRecipeSteps(recipe)
        setSteps(generatedSteps)
      } catch (error) {
        console.error('Error loading steps:', error)
        setSteps(recipe.steps || [
          'Gather and prepare all ingredients',
          'Follow recipe instructions carefully',
          'Monitor cooking times and temperatures',
          'Check for doneness',
          'Plate and serve'
        ])
      }
    }

    if (recipe) {
      recipeStartTime.current = Date.now()
      setChatMessages([{
        role: 'assistant',
        content: `Hi, I am Dishi! Your cooking assistant for ${recipe.name}. Ask me anything about ingredients, techniques, substitutions, or cooking tips!`
      }])
      loadSteps()
    }
  }, [recipe])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2 || isSearching) return
    setIsSearching(true)
    setSearchResults([])
    try {
      const aiSuggestions = await discoverRecipes(searchQuery)
      const enrichedResults = await Promise.all(
        aiSuggestions.map(async (r) => ({ ...r, image_url: r.image_url || null }))
      )
      setSearchResults(enrichedResults)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const switchToRecipe = async (recipeData: any) => {
    try {
      setLoading(true)
      const detailedRecipe = await generateRecipeDetails(recipeData.title)
      setRecipe({
        id: recipeData.id,
        name: detailedRecipe.name || recipeData.title,
        description: detailedRecipe.description || recipeData.description,
        image_url: recipeData.image_url,
        difficulty: detailedRecipe.difficulty || recipeData.difficulty,
        prep_time: detailedRecipe.prep_time,
        cook_time: detailedRecipe.cook_time,
        servings: detailedRecipe.servings,
        category: detailedRecipe.category,
        ingredients: detailedRecipe.ingredients,
        steps: detailedRecipe.steps
      })
      setSearchResults([])
      setSearchQuery('')
    } catch (error) {
      console.error('Error loading recipe:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!userInput.trim() || isChatLoading || !recipe) return
    const userMessage: Message = { role: 'user', content: userInput }
    setChatMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsChatLoading(true)
    try {
      const response = await sendChatMessage([...chatMessages, userMessage], recipe)
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure your OpenAI API key is set correctly in your .env file.'
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const toggleStepCompletion = (index: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
    }
    setCompletedSteps(newCompleted)
    if (steps.length > 0 && newCompleted.size === steps.length) {
      addRecipeLearned()
      if (recipeStartTime.current) {
        const minutesSpent = (Date.now() - recipeStartTime.current) / 1000 / 60
        addPracticeMinutes(minutesSpent)
      }
    }
  }

  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#44624a] animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading recipe...</p>
        </div>
      </div>
    )
  }

  // SEARCH VIEW
  if (!recipe) {
    return (
      <div className="min-h-screen bg-[#f8f5ef]">

        <Navbar activePage="Recipes" />

        {/* HERO */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#44624a] via-[#5d7a63] to-[#2f3c33]" />
          <div className="absolute right-0 top-0 text-[350px] opacity-10 leading-none">🍜</div>
          <div className="relative max-w-7xl mx-auto px-6 py-24">
            <div className="max-w-3xl">
              <p className="uppercase tracking-[0.35em] text-white/60 text-sm mb-5">
                Dishi's Recipe Discovery
              </p>
              <h1 className="text-6xl font-black text-white leading-tight mb-6">
                Discover Recipes <br />Like a Chef
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-10">
                Search for dishes, explore cuisines, and get step-by-step Dishi-powered cooking guidance.
              </p>

              <div className="bg-white rounded-[30px] p-3 shadow-2xl flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search recipes... (ramen, pasta, curry, desserts)"
                    className="w-full pl-14 pr-4 py-5 rounded-2xl bg-[#f8f5ef] text-lg focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-8 rounded-2xl bg-[#44624a] hover:bg-black text-white font-bold transition-all duration-300"
                >
                  {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Search'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div ref={resultsRef} className="max-w-7xl mx-auto px-6 py-14">
          {searchResults.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-black text-[#2f3c33] mb-2">Recipe Results</h2>
                  <p className="text-gray-500">Click any recipe to open full cooking mode.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => switchToRecipe(result)}
                    className="group bg-white rounded-[30px] overflow-hidden border border-[#ece7df] shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-60 overflow-hidden">
                      {result.image_url ? (
                        <img src={result.image_url} alt={result.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#44624a] to-[#2f3c33] flex items-center justify-center">
                          <ChefHat className="w-20 h-20 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-5 left-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur ${difficultyColors[result.difficulty as keyof typeof difficultyColors]}`}>
                          {result.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="p-7">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-[#44624a]" />
                        <span className="uppercase text-xs tracking-wide text-[#44624a] font-bold">{result.category}</span>
                      </div>
                      <h3 className="text-2xl font-black text-[#2f3c33] mb-3">{result.title}</h3>
                      <p className="text-gray-600 line-clamp-3 leading-relaxed mb-6">{result.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-5 text-sm text-gray-500">
                          <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{result.time}</div>
                          <div className="flex items-center gap-1"><Users className="w-4 h-4" />{result.servings}</div>
                        </div>
                        <div className="w-11 h-11 rounded-full bg-[#44624a] text-white flex items-center justify-center group-hover:translate-x-1 transition">→</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // RECIPE DETAIL VIEW
  const totalTime = recipe.prep_time || recipe.cook_time || '30 min'

  return (
    <div className="min-h-screen bg-[#f8f5ef]">

      <Navbar activePage="Recipes" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-[#ece7df]">
              <div className="relative h-[500px]">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#44624a] to-[#2d4a35] flex items-center justify-center">
                    <ChefHat className="w-24 h-24 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    {recipe.difficulty && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColors[recipe.difficulty]}`}>
                        {recipe.difficulty}
                      </span>
                    )}
                    {recipe.category && <span className="text-white/90">{recipe.category}</span>}
                  </div>
                  <h1 className="text-5xl font-black mb-3 leading-tight">{recipe.name}</h1>
                  <div className="flex items-center gap-6 text-white/90">
                    <div className="flex items-center gap-2"><Clock className="w-5 h-5" /><span>{totalTime}</span></div>
                    {recipe.servings && (
                      <div className="flex items-center gap-2"><Users className="w-5 h-5" /><span>{recipe.servings} servings</span></div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6"><p className="text-gray-700">{recipe.description}</p></div>
            </div>

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="bg-white rounded-[30px] p-8 shadow-xl border border-[#ece7df]">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-[#44624a]" />Ingredients
                </h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#44624a] rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Step-by-Step Instructions</h2>
              {steps.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-[#44624a] animate-spin" />
                  <span className="ml-3 text-gray-600">Generating cooking steps with AI...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        completedSteps.has(index) ? 'border-green-500 bg-green-50'
                        : currentStep === index ? 'border-[#44624a] bg-[#44624a]/5'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => { setCurrentStep(index); toggleStepCompletion(index) }}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {completedSteps.has(index) ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-[#44624a]">Step {index + 1}</span>
                        </div>
                        <p className={completedSteps.has(index) ? 'text-gray-600 line-through' : 'text-gray-700'}>{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - CHAT */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[30px] shadow-2xl border border-[#ece7df] h-[calc(100vh-8rem)] sticky top-24 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="bg-[#44624a] p-2 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Cooking Assistant</h3>
                    <p className="text-xs text-gray-500">Ask me anything!</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-4 py-3 ${message.role === 'user' ? 'bg-[#44624a] text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about cooking tips..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44624a] focus:border-transparent"
                    disabled={isChatLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isChatLoading || !userInput.trim()}
                    className="bg-[#44624a] hover:bg-[#3a5240] text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function RecipePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#44624a]" /></div>}>
      <RecipePageContent />
    </Suspense>
  )
}
