'use client'

import { useState } from 'react'
import { getStepExplanation } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AIExplanationProps {
  recipeId: number
  step: string
  stepNumber: number
  recipeName: string
}

export function AIExplanation({ recipeId, step, stepNumber, recipeName }: AIExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleGetExplanation = async () => {
    if (explanation) {
      setIsExpanded(!isExpanded)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getStepExplanation(recipeId, step, stepNumber)
      setExplanation(data.explanation)
      setIsExpanded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get explanation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGetExplanation}
        disabled={isLoading}
        variant="outline"
        className="w-full border-orange-500/50 hover:bg-orange-600/10 text-orange-600 hover:text-orange-700"
      >
        {isLoading && '⏳ '}
        {isLoading ? 'Getting AI Explanation...' : explanation ? (isExpanded ? '▼ Hide Explanation' : '▶ Show Explanation') : '💡 Get AI Explanation'}
      </Button>

      {isExpanded && explanation && (
        <Card className="p-4 bg-slate-900 border-orange-500/30">
          <div className="text-sm text-slate-100 space-y-3">
            {explanation.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
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
