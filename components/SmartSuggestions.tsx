'use client'

import { useState } from 'react'
import { getSmartSuggestions } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui'

interface SmartSuggestionsProps {
  recipeId: number
  recipeName: string
}

export function SmartSuggestions({ recipeId, recipeName }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleGetSuggestions = async () => {
    if (suggestions) {
      setIsExpanded(!isExpanded)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getSmartSuggestions(recipeId)
      setSuggestions(data.suggestions)
      setIsExpanded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGetSuggestions}
        disabled={isLoading}
        variant="outline"
        className="w-full border-blue-500/50 hover:bg-blue-600/10 text-blue-600 hover:text-blue-700"
      >
        {isLoading && '⏳ '}
        {isLoading ? 'Getting Suggestions...' : suggestions ? (isExpanded ? '▼ Hide Suggestions' : '▶ Show Suggestions') : '🔄 Get Smart Suggestions'}
      </Button>

      {isExpanded && suggestions && (
        <Card className="p-4 bg-slate-900 border-blue-500/30">
          <div className="text-sm text-slate-100 space-y-3">
            {suggestions.split('\n\n').map((paragraph, idx) => (
              <div key={idx} className="leading-relaxed">
                {paragraph.split('\n').map((line, lineIdx) => (
                  <p key={lineIdx} className="mb-1">
                    {line.startsWith('•') ? (
                      <span className="ml-2">{line}</span>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4 bg-red-900/20 border-red-700/50">
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}
    </div>
  )
}
