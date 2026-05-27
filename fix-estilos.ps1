$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# 1. Verificar que tailwind.config.js exista y esté bien
$tailwindConfig = @'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFE500',
        secondary: '#0A0A0A',
        accent: '#FFFFFF',
        gray: {
          dark: '#1A1A1A',
          medium: '#2A2A2A',
        }
      },
    },
  },
  plugins: [],
}
'@
[System.IO.File]::WriteAllText("$pwd\tailwind.config.js", $tailwindConfig, $utf8NoBom)
Write-Host "✅ tailwind.config.js verificado" -ForegroundColor Cyan

# 2. Verificar postcss.config.js
$postcssConfig = @'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
'@
[System.IO.File]::WriteAllText("$pwd\postcss.config.js", $postcssConfig, $utf8NoBom)
Write-Host "✅ postcss.config.js verificado" -ForegroundColor Cyan

# 3. Reescribir globals.css con Tailwind completo
$globalsCss = @'
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
  min-height: 100vh;
}

/* Colores personalizados */
.text-primary { color: #FFE500; }
.bg-primary { background-color: #FFE500; }
.bg-secondary { background-color: #0A0A0A; }
.bg-gray-dark { background-color: #1A1A1A; }
.border-primary { border-color: #FFE500; }

/* Utilidades adicionales */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
'@
[System.IO.File]::WriteAllText("$pwd\src\app\globals.css", $globalsCss, $utf8NoBom)
Write-Host "✅ globals.css reconstruido" -ForegroundColor Cyan

# 4. Verificar que layout.js importe globals.css correctamente
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
[System.IO.File]::WriteAllText("$pwd\src\app\layout.js", $layoutContent, $utf8NoBom)
Write-Host "✅ layout.js verificado" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== INSTALACION DE DEPENDENCIAS ===" -ForegroundColor Yellow
Write-Host "Reinstalando Tailwind y dependencias..." -ForegroundColor White

# 5. Reinstalar dependencias de Tailwind
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss postcss autoprefixer

Write-Host ""
Write-Host "=== COMPLETADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "PASOS:" -ForegroundColor Yellow
Write-Host "1. Parar servidor (Ctrl + C)" -ForegroundColor White
Write-Host "2. Limpiar cache: Remove-Item -Recurse -Force .next" -ForegroundColor Cyan
Write-Host "3. Ejecutar: npm run dev" -ForegroundColor White
Write-Host "4. Abrir en modo incognito: http://localhost:3000" -ForegroundColor White