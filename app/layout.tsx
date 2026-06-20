import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import LoadingScreen from '@/components/LoadingScreen'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DISHCOVERY - Smart Cooking Ideas for HRM Students',
  description: 'An innovative online platform for hospitality management students to explore interactive recipes, techniques, and culinary knowledge.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-white" suppressHydrationWarning>
      <body className="font-sans antialiased bg-white">
        <LoadingScreen />
        {children}
      </body>
    </html>
  )
}


