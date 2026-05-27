$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# 1. Actualizar layout.js con charset UTF-8 explícito
$layoutContent = @'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PreQualy M15 - Torneo ITF',
  description: 'Torneo Pre-Qualy oficial M15 ITF World Tennis Tour',
  charSet: 'utf-8'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-secondary text-white">
          {children}
        </main>
        <footer className="bg-gray-dark border-t border-primary/20 py-6 mt-16 text-center text-gray-500 text-sm">
          © 2024 PreQualy M15 Villa Constitución | #CAMINOALM15
        </footer>
      </body>
    </html>
  )
}
'@
[System.IO.File]::WriteAllText("src/app/layout.js", $layoutContent, $utf8NoBom)
Write-Host "✅ layout.js actualizado (UTF-8 forzado)" -ForegroundColor Cyan

# 2. Actualizar /jugadores para traer datos REALES de Supabase
$jugadoresContent = @'
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, User } from 'lucide-react'
import Link from 'next/link'

export default function JugadoresPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name')
    
    if (error) console.error('Error fetching players:', error)
    else setPlayers(data || [])
    setLoading(false)
  }

  const filtered = players.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.club && p.club.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="container mx-auto px-4 py-8 text-primary">Cargando jugadores...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">JUGADORES</h1>
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o club..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-dark border border-primary/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary" 
        />
      </div>
      
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No se encontraron jugadores.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(player => (
            <div key={player.id} className="bg-gray-dark rounded-xl p-6 border border-primary/20 hover:border-primary transition">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  {player.photo_url ? (
                    <img src={player.photo_url} alt={player.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary">{player.name}</h3>
                  <p className="text-gray-400 text-sm">{player.club || 'Sin club'}</p>
                  <p className="text-gray-400 text-sm">{player.hand === 'right' ? 'Derecha' : 'Izquierda'} | {player.age} años</p>
                  <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${player.paid ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>
                    {player.paid ? 'Inscripción Pagada' : 'Pendiente'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
'@
[System.IO.File]::WriteAllText("src/app/jugadores/page.js", $jugadoresContent, $utf8NoBom)
Write-Host "✅ /jugadores conectada a Supabase" -ForegroundColor Cyan

Write-Host ""
Write-Host "LISTO. Seguí estos pasos:" -ForegroundColor Green
Write-Host "1. Pará el servidor (Ctrl + C)" -ForegroundColor Yellow
Write-Host "2. Ejecutá: npm run dev" -ForegroundColor Yellow
Write-Host "3. Abrí http://localhost:3000/jugadores y hacé CTRL + SHIFT + R (hard refresh)" -ForegroundColor Yellow