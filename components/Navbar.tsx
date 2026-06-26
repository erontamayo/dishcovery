'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, Book, ShoppingCart, Scissors, Filter, NotebookPen } from 'lucide-react'
import { logout } from '@/lib/api'

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Recipes', href: '/recipe' },
  { label: 'Pantry', href: '/pantry-search' },
  { label: 'Techniques', href: '/techniques' },
  { label: 'Allergen & Diet', href: '/filters' },
  { label: 'Journal', href: '/reflection-log' },
]

const FEATURES = [
  { icon: Book, title: 'Recipes', href: '/recipe', description: 'Browse personalized recipes and cooking ideas.' },
  { icon: ShoppingCart, title: 'Pantry', href: '/pantry-search', description: 'Track and manage your available ingredients.' },
  { icon: Scissors, title: 'Techniques', href: '/techniques', description: 'Learn essential kitchen skills and methods.' },
  { icon: Filter, title: 'Allergen & Diet', href: '/filters', description: 'Customize meals based on allergies and diets.' },
  { icon: NotebookPen, title: 'Journal', href: '/reflection-log', description: 'Record cooking experiences and progress.' },
]

interface NavbarProps {
  activePage?: string
  userName?: string
}

export default function Navbar({ activePage, userName }: NavbarProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <>
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">

            {/* LOGO */}
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

            {/* NAV LINKS - DESKTOP */}
            <div className="hidden lg:flex items-center gap-10 text-sm font-semibold uppercase tracking-wide text-white">
              {NAV_LINKS.map(({ label, href }) => {
                const isActive = activePage === label
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

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">
              {userName && (
                <span className="hidden md:block text-sm text-zinc-300">
                  Welcome, <span className="font-semibold text-white">{userName}</span>
                </span>
              )}

              <button
                onClick={handleLogout}
                className="hidden lg:block bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-5 py-2 rounded-full transition"
              >
                Logout
              </button>

              {/* HAMBURGER - MOBILE ONLY */}
              <button
                className="lg:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* MOBILE MENU DRAWER - OUTSIDE NAV */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col">

          {/* DRAWER HEADER */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-white/10 shrink-0">
            <span className="text-white font-black text-lg">MENU</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-white">
              <X size={28} />
            </button>
          </div>

          {/* WELCOME */}
          {userName && (
            <div className="px-6 pt-6 shrink-0">
              <p className="text-white/60 text-sm">Welcome back,</p>
              <p className="text-white font-black text-xl">{userName}</p>
            </div>
          )}

          {/* FEATURE LINKS */}
          <div className="px-6 py-8 space-y-6 flex-1 overflow-y-auto">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-start gap-4 text-white"
                >
                  <div className="bg-white/10 p-3 rounded-xl shrink-0">
                    <Icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{feature.title}</p>
                    <p className="text-sm text-white/60">{feature.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* LOGOUT */}
          <div className="p-6 border-t border-white/10 shrink-0">
            <button
              onClick={handleLogout}
              className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl"
            >
              Logout
            </button>
          </div>

        </div>
      )}
    </>
  )
}
