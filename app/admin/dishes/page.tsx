'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getAllDishes, createDish, deleteDish } from '@/lib/api'
import Link from 'next/link'

interface Dish {
  id: number
  name: string
  description: string
  difficulty_level: string
  prep_time: number
  cook_time: number
  servings: number
}

export default function AdminDishesPage() {
  const router = useRouter()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty_level: 'intermediate',
    prep_time: 15,
    cook_time: 20,
    servings: 2,
    image_url: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        const dishesData = await getAllDishes(1, 100)
        setDishes(dishesData.data || [])
      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreating(true)

    try {
      await createDish(formData)
      const updated = await getAllDishes(1, 100)
      setDishes(updated.data || [])
      setFormData({
        name: '',
        description: '',
        difficulty_level: 'intermediate',
        prep_time: 15,
        cook_time: 20,
        servings: 2,
        image_url: ''
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dish')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteDish = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dish?')) return

    try {
      await deleteDish(id)
      setDishes(dishes.filter(d => d.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dish')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-orange-400 hover:text-orange-300 font-semibold">
            ← Back to Admin
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Manage Dishes</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {showForm ? 'Cancel' : '+ Add New Dish'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 text-red-200 border border-red-700 rounded-lg p-4 mb-8">
            {error}
          </div>
        )}

        {/* Add Dish Form */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Dish</h2>
            <form onSubmit={handleAddDish} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    placeholder="e.g., Pasta Carbonara"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Difficulty Level</label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Prep Time */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Prep Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.prep_time}
                    onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Cook Time */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Cook Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.cook_time}
                    onChange={(e) => setFormData({ ...formData, cook_time: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Servings */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Servings</label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 h-24 resize-none"
                  placeholder="Describe the dish, its origin, and why students should learn it..."
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  {creating ? 'Creating...' : 'Create Dish'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Dishes Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Dish Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Difficulty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Prep Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Cook Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Servings</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dishes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No dishes yet. Create your first dish!
                    </td>
                  </tr>
                ) : (
                  dishes.map(dish => (
                    <tr key={dish.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-white font-medium">{dish.name}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          dish.difficulty_level === 'beginner'
                            ? 'bg-green-500/20 text-green-200'
                            : dish.difficulty_level === 'intermediate'
                            ? 'bg-orange-500/20 text-orange-200'
                            : 'bg-red-500/20 text-red-200'
                        }`}>
                          {dish.difficulty_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{dish.prep_time} min</td>
                      <td className="px-6 py-4 text-slate-300">{dish.cook_time} min</td>
                      <td className="px-6 py-4 text-slate-300">{dish.servings}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => router.push(`/admin/dishes/${dish.id}`)}
                          className="text-orange-400 hover:text-orange-300 text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
