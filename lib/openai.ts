import OpenAI from 'openai'

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''

console.log('Unsplash key:', process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)

if (!OPENAI_API_KEY) {
  console.warn('⚠️ OpenAI API key not found.')
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

interface Recipe {
  name: string
  description: string
  ingredients?: string[]
  category?: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function cleanJSON(text: string): string {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
}

// ✅ NEW — Fetches food image from Unsplash
async function fetchFoodImage(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) return null

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query + ' food'
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    )

    if (!response.ok) {
      console.error('Unsplash API Error:', response.status)
      return null
    }

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small
    }

    return null
  } catch (error) {
    console.error('Unsplash error:', error)
    return null
  }
}

export async function sendChatMessage(messages: Message[], recipe: Recipe): Promise<string> {
  if (!OPENAI_API_KEY) {
    return 'Please set up your OpenAI API key in .env.local file.'
  }

  try {
    const systemPrompt = `You are a helpful cooking assistant for the recipe "${recipe.name}".

You help users with:
- Cooking techniques
- Ingredient substitutions
- Timing and temperature
- Troubleshooting

Recipe:
- ${recipe.name}
- ${recipe.description}

Be concise and practical.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return response.choices[0]?.message?.content || 'No response generated.'
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw error
  }
}

export async function getRecipeSteps(recipe: Recipe): Promise<string[]> {
  if (!OPENAI_API_KEY) {
    return [
      'Prepare ingredients',
      'Cook step by step',
      'Monitor heat',
      'Check doneness',
      'Serve'
    ]
  }

  try {
    const prompt = `Generate step-by-step cooking instructions for "${recipe.name}".

Return ONLY a JSON array of strings.
No markdown. No backticks. No explanation.

Example:
["Step 1...", "Step 2..."]`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 800
    })

    let content = response.choices[0]?.message?.content || '[]'
    content = cleanJSON(content)

    try {
      const parsed = JSON.parse(content)

      if (Array.isArray(parsed)) {
        return parsed.map(step =>
          String(step)
            .replace(/^Step\s*\d+[:.-]?\s*/i, '')
            .trim()
        )
      }
    } catch {
      console.warn('JSON parse failed, using fallback parsing')
    }

    return content
      .split('\n')
      .map(line =>
        line
          .replace(/^\d+[\).\s-]*/, '')
          .replace(/^Step\s*\d+[:.-]?\s*/i, '')
          .replace(/^["'\-\s]+|["'\-\s]+$/g, '')
          .trim()
      )
      .filter(line => line.length > 5)

  } catch (error) {
    console.error('Error generating steps:', error)
    return [
      'Prepare ingredients',
      'Cook carefully',
      'Monitor temperature',
      'Check doneness',
      'Serve'
    ]
  }
}

// ✅ UPDATED — now fetches Unsplash images for each result
export async function discoverRecipes(query: string): Promise<any[]> {
  if (!OPENAI_API_KEY) return []

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Suggest 5-8 recipes.

Return ONLY JSON array:
[
  {
    "id": "unique-id",
    "name": "Recipe Name",
    "description": "Short description",
    "difficulty_level": "Beginner",
    "prep_time": 15,
    "cook_time": 30,
    "servings": 4,
    "category": "Category"
  }
]

No markdown.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    let aiResponse = response.choices[0]?.message?.content || '[]'
    aiResponse = cleanJSON(aiResponse)

    try {
      const recipes = JSON.parse(aiResponse)

      if (!Array.isArray(recipes)) return []

      // ✅ Fetch Unsplash images in parallel
      const recipesWithImages = await Promise.all(
        recipes.map(async (r: any, i: number) => {
          const image_url = await fetchFoodImage(r.name || query)

          return {
            id: r.id || `recipe-${i}`,
            title: r.name || 'Untitled Recipe',
            description: r.description || '',
            difficulty: r.difficulty_level || 'Beginner',
            time: `${(r.prep_time || 0) + (r.cook_time || 0)} min`,
            servings: r.servings || 2,
            category: r.category || 'General',
            image_url
          }
        })
      )

      return recipesWithImages

    } catch (err) {
      console.error('Parse error:', err)
      return []
    }

  } catch (error) {
    console.error('Discovery error:', error)
    return []
  }
}

export async function generateRecipeDetails(recipeName: string, recipeDescription?: string) {
  if (!OPENAI_API_KEY) {
    return {
      ingredients: ['Missing API key'],
      steps: ['Configure OpenAI API key']
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Return ONLY JSON:

{
  "ingredients": ["item"],
  "steps": ["step"]
}

No markdown.`
        },
        {
          role: 'user',
          content: `Recipe: ${recipeName}\n${recipeDescription || ''}`
        }
      ],
      temperature: 0.6,
      max_tokens: 2000
    })

    let aiResponse = cleanJSON(response.choices[0]?.message?.content || '{}')

    try {
      const parsed = JSON.parse(aiResponse)

      return {
        ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
        steps: Array.isArray(parsed.steps) ? parsed.steps : []
      }
    } catch (err) {
      console.error('Parse error:', err)
      return {
        ingredients: ['Fallback ingredient'],
        steps: ['Fallback step']
      }
    }

  } catch (error) {
    console.error('Generate error:', error)
    return {
      ingredients: ['Error'],
      steps: ['Error']
    }
  }
}
