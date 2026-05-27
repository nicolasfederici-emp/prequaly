'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, Settings } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  
  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/cuadro', label: 'Cuadro' },
    { href: '/resultados', label: 'Resultados' },
    { href: '/jugadores', label: 'Jugadores' },
    { href: '/reglamento', label: 'Reglamento' },
    { href: '/patrocinadores', label: 'Sponsors' },
  ]

  return (
    <nav className="bg-secondary border-b-2 border-primary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl text-primary">M15</span>
          </Link>
          
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
    </nav>
  )
}