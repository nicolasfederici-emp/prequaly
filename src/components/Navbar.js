'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Trophy, Settings, Menu, X, Cloud, Sun, CloudRain } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navText, setNavText] = useState('M15')
  const [weather, setWeather] = useState(null)
  
  useEffect(() => {
    fetchSettings()
    fetchWeather()
  }, [])

  const fetchWeather = async () => {
    try {
      // Villa Constitución, AR coordinates
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-33.2278&longitude=-60.3297&current_weather=true')
      const data = await res.json()
      if (data && data.current_weather) {
        setWeather(data.current_weather)
      }
    } catch (e) {
      console.error('Weather fetch error:', e)
    }
  }

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="w-4 h-4 text-yellow-400" />
    if (code >= 1 && code <= 3) return <Cloud className="w-4 h-4 text-gray-300" />
    if (code >= 51 && code <= 65) return <CloudRain className="w-4 h-4 text-blue-400" />
    return <Cloud className="w-4 h-4 text-gray-300" />
  }

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').eq('key', 'nav_brand_text')
    if (data && data.length > 0 && data[0].value) {
      setNavText(data[0].value)
    }
  }

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/cuadro', label: 'Cuadro' },
    { href: '/resultados', label: 'Resultados' },
    { href: '/jugadores', label: 'Jugadores' },
    { href: '/galeria', label: 'Galería' },
    { href: '/reglamento', label: 'Información' },
    { href: '/patrocinadores', label: 'Sponsors' },
  ]

  return (
    <nav className="bg-secondary border-b-2 border-primary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl text-primary">{navText}</span>
            </Link>
            
            {weather && (
              <div className="hidden lg:flex items-center gap-1.5 bg-gray-dark px-3 py-1 rounded-full border border-primary/20 text-xs font-medium text-gray-300" title="Clima en Villa Constitución">
                {getWeatherIcon(weather.weathercode)}
                <span>{Math.round(weather.temperature)}°C</span>
              </div>
            )}
          </div>
          <button className="md:hidden p-2 text-gray-300 hover:text-primary transition" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
  {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
</button>
          
          <div className="hidden md:flex space-x-4 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  pathname === link.href ? 'text-primary bg-gray-dark' : 'text-gray-300 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin" className="ml-4 p-2 text-gray-400 hover:text-primary transition" title="Panel Admin">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
{mobileOpen && (
  <div className="md:hidden bg-secondary border-t border-primary">
    <div className="flex flex-col px-2 py-2 space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-primary"
          onClick={() => setMobileOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </div>
  </div>
)}
    </nav>
  )
}