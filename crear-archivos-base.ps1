# crear-archivos-base.ps1
$ErrorActionPreference = "Stop"

# Configurar encoding UTF-8 SIN BOM (crucial para Next.js)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Crear carpeta src/app si no existe
$appDir = "src/app"
if (!(Test-Path $appDir)) {
    New-Item -ItemType Directory -Force -Path $appDir | Out-Null
}

# Contenido de layout.js
$layoutContent = @'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PreQualy M15 - Torneo ITF',
  description: 'Torneo Pre-Qualy oficial M15 ITF World Tennis Tour',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <main className="min-h-screen bg-secondary text-white">
          {children}
        </main>
      </body>
    </html>
  )
}
'@

# Contenido de page.js
$pageContent = @'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-4"> PREQUALY M15</h1>
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

# Contenido de globals.css
$cssContent = @'
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

# Escribir archivos con encoding correcto
[System.IO.File]::WriteAllText("$appDir/layout.js", $layoutContent, $utf8NoBom)
[System.IO.File]::WriteAllText("$appDir/page.js", $pageContent, $utf8NoBom)
[System.IO.File]::WriteAllText("$appDir/globals.css", $cssContent, $utf8NoBom)

Write-Host "✅ Archivos creados exitosamente en src/app/" -ForegroundColor Green
Write-Host "📄 layout.js" -ForegroundColor Cyan
Write-Host " page.js" -ForegroundColor Cyan
Write-Host "📄 globals.css" -ForegroundColor Cyan
Write-Host "`n🚀 Ahora ejecutá: npm run dev" -ForegroundColor Yellow