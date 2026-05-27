$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

Write-Host "=== CONFIGURACION MINIMA DE TAILWIND ===" -ForegroundColor Cyan
Write-Host ""

# 1. globals.css - Mínimo y directo
$globalsCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@
[System.IO.File]::WriteAllText("$pwd\src\app\globals.css", $globalsCss, $utf8NoBom)
Write-Host "✅ globals.css creado" -ForegroundColor Green

# 2. tailwind.config.js - Configuración exacta para Next.js 14 App Router
$tailwindConfig = @"
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
      }
    },
  },
  plugins: [],
}
"@
[System.IO.File]::WriteAllText("$pwd\tailwind.config.js", $tailwindConfig, $utf8NoBom)
Write-Host "✅ tailwind.config.js creado" -ForegroundColor Green

# 3. postcss.config.js - Configuración estándar
$postcssConfig = @"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@
[System.IO.File]::WriteAllText("$pwd\postcss.config.js", $postcssConfig, $utf8NoBom)
Write-Host "✅ postcss.config.js creado" -ForegroundColor Green

# 4. layout.js - Simple pero funcional
$layoutContent = @"
import './globals.css'

export const metadata = {
  title: 'PreQualy M15',
  description: 'Torneo ITF',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-secondary text-white">
        {children}
      </body>
    </html>
  )
}
"@
[System.IO.File]::WriteAllText("$pwd\src\app\layout.js", $layoutContent, $utf8NoBom)
Write-Host "✅ layout.js creado" -ForegroundColor Green

# 5. page.js - Con estilos inline de Tailwind claros
$pageContent = @"
export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-yellow-400 mb-6">
          PREQUALY M15
        </h1>
        <p className="text-2xl text-gray-300 mb-8">
          Torneo Profesional ITF - Villa Constitucion
        </p>
        <div className="space-y-4">
          <button className="bg-yellow-400 text-black font-bold py-4 px-8 rounded-lg text-xl hover:bg-yellow-300 transition">
            VER CUADRO
          </button>
          <div className="text-left mt-8 p-6 bg-gray-900 rounded-lg border border-yellow-400">
            <h2 className="text-yellow-400 font-bold mb-2">Si ves esto con estilo:</h2>
            <ul className="text-gray-300 space-y-1">
              <li>✓ Fondo negro</li>
              <li>✓ Texto amarillo</li>
              <li>✓ Botón amarillo</li>
              <li>✓ Tailwind FUNCIONA</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
"@
[System.IO.File]::WriteAllText("$pwd\src\app\page.js", $pageContent, $utf8NoBom)
Write-Host "✅ page.js creado" -ForegroundColor Green

Write-Host ""
Write-Host "=== VERIFICANDO TAILWIND INSTALADO ===" -ForegroundColor Yellow

# Verificar si Tailwind está instalado
$tailwindCheck = npm list tailwindcss --depth=0 2>&1
if ($tailwindCheck -match "tailwindcss@3") {
    Write-Host "✅ Tailwind v3 está instalado" -ForegroundColor Green
} elseif ($tailwindCheck -match "tailwindcss@4") {
    Write-Host "⚠️  Tailwind v4 detectado. Desinstalando..." -ForegroundColor Yellow
    npm uninstall tailwindcss
    npm install -D tailwindcss@3.4.1
    Write-Host "✅ Tailwind v3.4.1 instalado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Tailwind no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -D tailwindcss@3.4.1 postcss autoprefixer
    Write-Host "✅ Tailwind instalado" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== CONFIGURACION COMPLETADA ===" -ForegroundColor Green
Write-Host ""
Write-Host "AHORA:" -ForegroundColor Yellow
Write-Host "1. Cerrar esta ventana de terminal" -ForegroundColor White
Write-Host "2. Abrir NUEVA ventana de PowerShell" -ForegroundColor White
Write-Host "3. Navegar: cd C:\tmp\prequaly-m15" -ForegroundColor White
Write-Host "4. Ejecutar: npm run dev" -ForegroundColor White
Write-Host "5. Abrir en modo incognito: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Deberías ver fondo NEGRO, texto AMARILLO y botón AMARILLO" -ForegroundColor Cyan