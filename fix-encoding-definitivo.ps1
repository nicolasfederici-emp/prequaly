$ErrorActionPreference = "Stop"

# Función para escribir sin BOM
function Write-UTF8NoBOM {
    param($Path, $Content)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText("$pwd\$Path", $Content, $utf8NoBom)
}

# 1. Crear next.config.js con headers UTF-8 forzados
$nextConfig = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'supabase.co'],
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/html; charset=utf-8',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
'@
Write-UTF8NoBOM "next.config.js" $nextConfig

# 2. Reescribir layout.js con meta tags EXPLÍCITOS
$layoutContent = @'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PreQualy M15 - Torneo ITF',
  description: 'Torneo Pre-Qualy oficial M15 ITF World Tennis Tour',
  charset: 'utf-8',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-secondary text-white">
          {children}
        </main>
        <footer className="bg-gray-dark border-t border-primary/20 py-6 mt-16 text-center text-gray-500 text-sm">
          (c) 2024 PreQualy M15 Villa Constitucion | #CAMINOALM15
        </footer>
      </body>
    </html>
  )
}
'@
Write-UTF8NoBOM "src/app/layout.js" $layoutContent

# 3. Reescribir page.js (HOME) SIN caracteres especiales
$pageContent = @'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-4">PREQUALY M15</h1>
      <p className="text-xl text-gray-300 mb-8">Torneo Profesional ITF - Villa Constitucion</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/cuadro" className="bg-primary text-secondary p-6 rounded-xl font-bold text-center hover:bg-yellow-400 transition">
          VER CUADRO
        </Link>
        <Link href="/jugadores" className="bg-gray-dark border-2 border-primary p-6 rounded-xl font-bold text-center hover:bg-gray-800 transition">
          JUGADORES
        </Link>
      </div>
    </div>
  )
}
'@
Write-UTF8NoBOM "src/app/page.js" $pageContent

# 4. Limpiar cachés
Write-Host "Limpiando caches..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Recurse -Force .next }
if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue }

Write-Host ""
Write-Host "=== REPARACION COMPLETADA ===" -ForegroundColor Green
Write-Host ""
Write-Host "PASOS CRITICOS (en orden):" -ForegroundColor Yellow
Write-Host "1. Cerrar TODAS las ventanas del navegador" -ForegroundColor White
Write-Host "2. Ejecutar: npm run dev" -ForegroundColor Cyan
Write-Host "3. Abrir navegador en MODO INCOGNITO (Ctrl + Shift + N)" -ForegroundColor White
Write-Host "4. Entrar a: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Si SIGUE viendo caracteres raros:" -ForegroundColor Red
Write-Host "- Verifique que el navegador muestre UTF-8 en DevTools" -ForegroundColor White
Write-Host "- Pruebe en otro navegador (Chrome/Firefox/Edge)" -ForegroundColor White
Write-Host "- Revise el archivo layout.js con VS Code" -ForegroundColor White