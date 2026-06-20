'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, register } from '@/lib/api'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()

  const [isRegistering, setIsRegistering] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      if (isRegistering) {
        await register(email, password, name)

        setIsRegistering(false)

        setEmail('')
        setPassword('')
        setName('')

        setError('Registration successful! Please log in.')
      } else {
        const res = await login(email, password)

        localStorage.setItem('token', res.token)

        router.push('/dashboard')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f5ef]">

      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/login-page.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#44624a]/70 via-black/40 to-black/80" />
      </div>

      {/* DECORATIVE BLURS */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-yellow-400/20 rounded-full blur-3xl" />

      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-[#44624a]/30 rounded-full blur-3xl" />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-10">

        <div className="grid lg:grid-cols-2 gap-10 items-center w-full max-w-7xl">

          {/* LEFT SIDE */}
          <div className="hidden lg:block text-white">

            <p className="uppercase tracking-[0.35em] text-sm text-yellow-300 mb-6">
              Cooking Made Smarter with Dishcovery
            </p>

            <h1 className="text-6xl font-black leading-[1.05] mb-8">
              Learn.
              <br />
              Cook.
              <br />
              Master.
            </h1>

            <p className="text-xl text-white/75 leading-relaxed max-w-xl">
              Discover recipes, improve your skills,
              track your cooking journey, and become the
              cook you aspire to be.
            </p>

            <div className="flex gap-4 mt-10">

              <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-4">
                <p className="text-3xl font-black">
                  500+
                </p>
                <p className="text-white/70 text-sm">
                  Recipes
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-4">
                <p className="text-3xl font-black">
                  AI
                </p>
                <p className="text-white/70 text-sm">
                  Smart Search
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-4">
                <p className="text-3xl font-black">
                  Journal
                </p>
                <p className="text-white/70 text-sm">
                  Reflections
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full flex justify-center">

            <div
              className="
                w-full
                max-w-md
                bg-white/85
                backdrop-blur-2xl
                border
                border-white/30
                rounded-[32px]
                shadow-[0_20px_80px_rgba(0,0,0,0.35)]
                p-8 lg:p-10
              "
            >

              {/* LOGO */}
              <div className="flex justify-center mb-6">

                <div className="relative">

                  <div className="absolute inset-0 bg-[#44624a]/20 blur-2xl rounded-full" />

                  <Image
                    src="/updated-dishcovery-logo.png"
                    alt="Dishcovery Logo"
                    width={120}
                    height={120}
                    priority
                    className="relative z-10 w-28 h-28 drop-shadow-xl"
                  />
                </div>
              </div>

              {/* HEADER */}
              <div className="text-center mb-8">

                <h2 className="text-4xl font-black text-[#2f3c33] mb-3">
                  {isRegistering
                    ? 'Create Account'
                    : 'Welcome Back'}
                </h2>

                <p className="text-gray-500 leading-relaxed">
                  {isRegistering
                    ? 'Start your culinary learning journey.'
                    : 'Continue your Dishcovery experience.'}
                </p>
              </div>

              {/* ALERT */}
              {error && (
                <div
                  className={`
                    mb-6
                    rounded-2xl
                    px-4
                    py-4
                    text-sm
                    border
                    ${
                      error.includes('successful')
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }
                  `}
                >
                  {error}
                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {isRegistering && (
                  <div>
                    <label className="block text-sm font-semibold text-[#2f3c33] mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="John Doe"
                      required
                      className="
                        w-full
                        rounded-2xl
                        border border-[#ddd7cf]
                        bg-[#fcfbf8]
                        px-4 py-4
                        text-gray-800
                        placeholder:text-gray-400
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#44624a]
                        transition
                      "
                    />
                  </div>
                )}

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-semibold text-[#2f3c33] mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    className="
                      w-full
                      rounded-2xl
                      border border-[#ddd7cf]
                      bg-[#fcfbf8]
                      px-4 py-4
                      text-gray-800
                      placeholder:text-gray-400
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#44624a]
                      transition
                    "
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-sm font-semibold text-[#2f3c33] mb-2">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="••••••••"
                      required
                      className="
                        w-full
                        rounded-2xl
                        border border-[#ddd7cf]
                        bg-[#fcfbf8]
                        px-4 py-4
                        pr-14
                        text-gray-800
                        placeholder:text-gray-400
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#44624a]
                        transition
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        hover:text-[#44624a]
                        transition
                      "
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>

                  </div>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
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
                    flex
                    items-center
                    justify-center
                    gap-3
                  "
                >

                  {loading && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}

                  {loading
                    ? 'Please wait...'
                    : isRegistering
                    ? 'Create Account'
                    : 'Log In'}
                </button>
              </form>

              {/* TOGGLE */}
              <div className="mt-8 text-center">

                <p className="text-sm text-gray-600">
                  {isRegistering
                    ? 'Already have an account?'
                    : "Don't have an account?"}

                  <button
                    onClick={() => {
                      setIsRegistering(!isRegistering)

                      setError('')
                      setEmail('')
                      setPassword('')
                      setName('')
                    }}
                    className="
                      ml-2
                      font-bold
                      text-[#44624a]
                      hover:text-black
                      transition
                    "
                  >
                    {isRegistering
                      ? 'Log In'
                      : 'Create Account'}
                  </button>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}