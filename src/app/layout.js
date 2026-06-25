import { Inter, Oswald } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' })

export const metadata = {
  title: 'PreQualy M15 - Torneo ITF',
  description: 'Torneo Pre-Qualy oficial M15 ITF World Tennis Tour',
}

import Script from 'next/script'
import { supabase } from '@/lib/supabase'

export default async function RootLayout({ children }) {
  // Fetch theme colors dynamically
  let themePrimary = '#D0FD3E'
  let themeSecondary = '#081411'
  let themeClay = '#C2563C'
  let themeGrayDark = '#111E1A'
  let themeText = '#ffffff'

  try {
    const { data: settings } = await supabase.from('settings').select('*')
    if (settings) {
      settings.forEach(s => {
        if (s.key === 'theme_primary' && s.value) themePrimary = s.value
        if (s.key === 'theme_secondary' && s.value) themeSecondary = s.value
        if (s.key === 'theme_clay' && s.value) themeClay = s.value
        if (s.key === 'theme_gray_dark' && s.value) themeGrayDark = s.value
        if (s.key === 'theme_text' && s.value) themeText = s.value
      })
    }
  } catch (error) {
    console.error('Error fetching theme settings:', error)
  }

  return (
    <html lang="es">
      <head>
        <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
        <style>{`
          :root {
            --theme-primary: ${themePrimary};
            --theme-secondary: ${themeSecondary};
            --theme-clay: ${themeClay};
            --theme-gray-dark: ${themeGrayDark};
            --theme-text: ${themeText};
          }
        `}</style>
      </head>
      <body className={`${inter.className} ${oswald.variable}`}>
        <Navbar />
        <main className="min-h-screen bg-secondary text-theme-text">
          {children}
        </main>
        <footer className="bg-gray-dark border-t border-primary/20 py-6 mt-16 text-center text-gray-500 text-sm">
          © 2024 PreQualy M15 Villa Constitución | #CAMINOALM15
        </footer>
      </body>
    </html>
  )
}