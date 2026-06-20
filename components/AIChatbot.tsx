'use client'

import { useState, useRef, useEffect } from 'react'
import { chatWithAI, getChatHistory } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface AIChatbotProps {
  recipeId: number
  recipeName: string
  isOpen?: boolean
  onClose?: () => void
}

export function AIChatbot({ recipeId, recipeName, isOpen = true, onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getChatHistory(recipeId)
        if (data.history) {
          const formattedHistory: Message[] = data.history.flatMap((msg: any) => [
            { role: 'user' as const, content: msg.question },
            { role: 'assistant' as const, content: msg.ai_response }
          ])
          setMessages(formattedHistory)
        }
      } catch (err) {
        console.log('No chat history found for this recipe')
      }
    }

    if (isOpen) {
      loadHistory()
    }
  }, [recipeId, isOpen])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setError(null)
    setIsLoading(true)

    try {
      const response = await chatWithAI(recipeId, userMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Card className="flex flex-col h-full bg-slate-900 border-orange-500/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h3 className="font-semibold text-white">AI Chef Assistant</h3>
          <p className="text-xs text-slate-400">{recipeName}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm mb-3">
              Ask me anything about this recipe! I can help with:
            </p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Cooking techniques and tips</li>
              <li>• Ingredient substitutions</li>
              <li>• Timing and temperature guidance</li>
              <li>• Common mistakes to avoid</li>
            </ul>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-100 border border-slate-700 px-4 py-2 rounded-lg">
              <p className="text-sm text-slate-400">Thinking...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-red-900/30 text-red-400 border border-red-700 px-4 py-2 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the recipe..."
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-orange-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Send
          </Button>
        </div>
      </form>
    </Card>
  )
}
