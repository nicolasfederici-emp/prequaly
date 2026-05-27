$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# 1. Crear estructura de carpetas
$dirs = @(
    "src/app/cuadro",
    "src/app/jugadores",
    "src/app/resultados",
    "src/app/reglamento",
    "src/app/patrocinadores",
    "src/app/admin",
    "src/components",
    "src/lib"
)
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
}

# 2. Definir contenido de archivos
$files = @{
    "src/app/layout.js" = @'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PreQualy M15 - Torneo ITF',
  description: 'Torneo Pre-Qualy oficial M15 ITF World Tennis Tour',
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

    "src/app/page.js" = @'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-4">PREQUALY M15</h1>
      <p className="text-xl text-gray-300 mb-8">Torneo Profesional ITF - Villa Constitución</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/cuadro" className="bg-primary text-secondary p-6 rounded-xl font-bold text-center hover:bg-yellow-400 transition">
          VER CUADRO →
        </Link>
        <Link href="/jugadores" className="bg-gray-dark border-2 border-primary p-6 rounded-xl font-bold text-center hover:bg-gray-800 transition">
          JUGADORES →
        </Link>
      </div>
    </div>
  )
}
'@

    "src/app/globals.css" = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 10, 10, 10;
  --background-end-rgb: 10, 10, 10;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-start-rgb));
}

.text-primary { color: #FFE500; }
.bg-primary { background-color: #FFE500; }
.bg-secondary { background-color: #0A0A0A; }
.bg-gray-dark { background-color: #1A1A1A; }
.border-primary { border-color: #FFE500; }
'@

    "src/components/Navbar.js" = @'
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
'@

    "src/lib/supabase.js" = @'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
'@

    "src/app/cuadro/page.js" = @'
'use client'
import { Printer } from 'lucide-react'

export default function CuadroPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary">CUADRO DEL TORNEO</h1>
        <button className="flex items-center gap-2 bg-primary text-secondary px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition print:hidden">
          <Printer className="w-5 h-5" />
          Imprimir
        </button>
      </div>
      <div className="bg-gray-dark border border-primary/20 rounded-xl p-8 text-center">
        <p className="text-xl text-gray-300">El bracket se cargará automáticamente desde la base de datos.</p>
        <p className="text-primary mt-2 font-mono">48 JUGADORES | ELIMINACIÓN DIRECTA</p>
      </div>
    </div>
  )
}
'@

    "src/app/jugadores/page.js" = @'
'use client'
import { Search } from 'lucide-react'

export default function JugadoresPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">JUGADORES</h1>
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar jugador..." className="w-full bg-gray-dark border border-primary/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="bg-gray-dark rounded-xl p-6 border border-primary/20 hover:border-primary transition cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl"></div>
              <div>
                <h3 className="font-bold text-lg text-primary">Jugador {i}</h3>
                <p className="text-gray-400 text-sm">Club Ejemplo | Derecha</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
'@

    "src/app/resultados/page.js" = @'
'use client'
import { useState } from 'react'
import { Clock } from 'lucide-react'

export default function ResultadosPage() {
  const [filter, setFilter] = useState('all')
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">RESULTADOS</h1>
      <div className="flex gap-4 mb-8">
        {['all','upcoming','completed'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-2 rounded-lg font-bold ${filter===f?'bg-primary text-secondary':'bg-gray-dark text-gray-300'}`}>
            {f==='all'?'Todos':f==='upcoming'?'Próximos':'Finalizados'}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {[1,2].map(i => (
          <div key={i} className="bg-gray-dark rounded-xl p-6 border border-primary/20">
            <div className="flex justify-between items-start mb-4">
              <span className="text-primary font-bold">Ronda {i}</span>
              <span className="text-gray-400 text-sm flex items-center gap-1"><Clock className="w-4 h-4"/> Próximamente</span>
            </div>
            <div className="space-y-2 text-lg">
              <div className="flex justify-between"><span>Jugador A</span><span>-</span></div>
              <div className="flex justify-between"><span>Jugador B</span><span>-</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
'@

    "src/app/reglamento/page.js" = @'
export default function ReglamentoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-primary mb-8">REGLAMENTO</h1>
      <div className="bg-gray-dark rounded-2xl p-8 border border-primary/20 space-y-6 text-gray-300">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">1. INSCRIPCIÓN</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Cupo: 48 jugadores masculinos</li>
            <li>Valor: $60.000 (Mercado Pago: estebanspinetta)</li>
            <li>Enviar comprobante al 3400 517063</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">2. SISTEMA DE JUEGO</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Eliminación directa</li>
            <li>2 sets gain + tiebreak en el 3ro</li>
            <li>No-Ad en juegos finales</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">3. PREMIOS</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Campeón: WC Cuadro Principal M15</li>
            <li>Finalista: WC Clasificación M15</li>
            <li>WC no transferibles. Requiere IPIN al día.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
'@

    "src/app/patrocinadores/page.js" = @'
export default function PatrocinadoresPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">PATROCINADORES</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {[1,2,3].map(i => (
          <div key={i} className="bg-gray-dark rounded-xl p-6 border border-primary/20 text-center">
            <div className="w-full h-32 bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-gray-500">Logo Sponsor {i}</div>
            <h3 className="text-xl font-bold text-primary mb-2">Sponsor {i}</h3>
            <p className="text-gray-400 text-sm">Espacio para descripción o link.</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border-2 border-primary text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">¿Querés ser parte?</h2>
        <a href="mailto:estebanspinetta@gmail.com" className="bg-primary text-secondary px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition inline-block">
          Contactanos
        </a>
      </div>
    </div>
  )
}
'@

    "src/app/admin/page.js" = @'
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState('')
  const [form, setForm] = useState({ name: '', age: '', hand: 'right', club: '', paid: false })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const login = (e) => {
    e.preventDefault()
    if (pass === 'admin123') setAuth(true)
    else setMsg('Contraseña incorrecta')
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const { error } = await supabase.from('players').insert([{
      name: form.name,
      age: parseInt(form.age),
      hand: form.hand,
      club: form.club,
      paid: form.paid
    }])
    if (error) setMsg('Error: ' + error.message)
    else {
      setMsg('Jugador guardado correctamente')
      setForm({ name: '', age: '', hand: 'right', club: '', paid: false })
    }
    setLoading(false)
  }

  if (!auth) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-sm text-center">
        <h1 className="text-2xl font-bold text-primary mb-6">Acceso Organización</h1>
        <form onSubmit={login} className="space-y-4">
          <input type="password" placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} className="w-full bg-gray-dark border border-primary/30 rounded-lg px-4 py-3 text-white" />
          <button className="w-full bg-primary text-secondary font-bold py-3 rounded-lg">Entrar</button>
          {msg && <p className="text-red-400">{msg}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-primary mb-6">Cargar Jugador</h1>
      <form onSubmit={submit} className="bg-gray-dark p-6 rounded-xl border border-primary/20 space-y-4">
        <div>
          <label className="block text-gray-300 mb-1 text-sm">Nombre completo *</label>
          <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Edad *</label>
            <input required type="number" value={form.age} onChange={e=>setForm({...form, age:e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Mano</label>
            <select value={form.hand} onChange={e=>setForm({...form, hand:e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white">
              <option value="right">Derecha</option>
              <option value="left">Izquierda</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-gray-300 mb-1 text-sm">Club / Ciudad</label>
          <input value={form.club} onChange={e=>setForm({...form, club:e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.paid} onChange={e=>setForm({...form, paid:e.target.checked})} className="w-4 h-4 accent-primary" />
          <span className="text-gray-300">Inscripción abonada</span>
        </label>
        <button disabled={loading} className="w-full bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar Jugador'}
        </button>
        {msg && <p className={`text-center font-bold ${msg.includes('correctamente')?'text-green-400':'text-red-400'}`}>{msg}</p>}
      </form>
      <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-primary font-bold mb-2">Instrucciones para los profes:</h3>
        <ul className="text-gray-400 text-sm list-disc list-inside space-y-1">
          <li>Completá los datos y dale a "Guardar".</li>
          <li>La foto se podrá subir después desde la ficha del jugador.</li>
          <li>Contraseña actual: admin123 (cambiala en el código si querés).</li>
        </ul>
      </div>
    </div>
  )
}
'@
}

# 3. Escribir archivos con UTF-8 sin BOM
foreach ($path in $files.Keys) {
    [System.IO.File]::WriteAllText($path, $files[$path], $utf8NoBom)
    Write-Host "OK: $path" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "PROYECTO COMPLETO CREADO" -ForegroundColor Green
Write-Host "ACCESO ADMIN: http://localhost:3000/admin (Clave: admin123)" -ForegroundColor Yellow
Write-Host "EJECUTAR: npm run dev" -ForegroundColor Cyan