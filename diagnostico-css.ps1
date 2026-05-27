$ErrorActionPreference = "Stop"

Write-Host "=== DIAGNOSTICO COMPLETO DE CSS ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que globals.css exista
Write-Host "1. Verificando src/app/globals.css..." -ForegroundColor Yellow
if (Test-Path "src/app/globals.css") {
    Write-Host "   ✅ Archivo existe" -ForegroundColor Green
    $cssContent = Get-Content "src/app/globals.css" -Raw
    if ($cssContent -match "@tailwind") {
        Write-Host "   ✅ Contiene directivas @tailwind" -ForegroundColor Green
    } else {
        Write-Host "   ❌ NO contiene @tailwind" -ForegroundColor Red
    }
    Write-Host "   Contenido:" -ForegroundColor Gray
    Write-Host "   $($cssContent -replace "`r`n", "`n   ")" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Archivo NO existe" -ForegroundColor Red
}

Write-Host ""

# 2. Verificar que layout.js importe globals.css
Write-Host "2. Verificando src/app/layout.js..." -ForegroundColor Yellow
if (Test-Path "src/app/layout.js") {
    Write-Host "   ✅ Archivo existe" -ForegroundColor Green
    $layoutContent = Get-Content "src/app/layout.js" -Raw
    if ($layoutContent -match "import.*globals.css") {
        Write-Host "   ✅ Importa globals.css" -ForegroundColor Green
    } else {
        Write-Host "   ❌ NO importa globals.css" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Archivo NO existe" -ForegroundColor Red
}

Write-Host ""

# 3. Verificar tailwind.config.js
Write-Host "3. Verificando tailwind.config.js..." -ForegroundColor Yellow
if (Test-Path "tailwind.config.js") {
    Write-Host "   ✅ Archivo existe" -ForegroundColor Green
    $tailwindContent = Get-Content "tailwind.config.js" -Raw
    if ($tailwindContent -match "src/app") {
        Write-Host "   ✅ Incluye './src/app' en content" -ForegroundColor Green
    } else {
        Write-Host "   ❌ NO incluye './src/app' en content" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Archivo NO existe" -ForegroundColor Red
}

Write-Host ""

# 4. Verificar postcss.config.js
Write-Host "4. Verificando postcss.config.js..." -ForegroundColor Yellow
if (Test-Path "postcss.config.js") {
    Write-Host "   ✅ Archivo existe" -ForegroundColor Green
    $postcssContent = Get-Content "postcss.config.js" -Raw
    if ($postcssContent -match "tailwindcss") {
        Write-Host "   ✅ Configura tailwindcss" -ForegroundColor Green
    } else {
        Write-Host "   ❌ NO configura tailwindcss" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Archivo NO existe" -ForegroundColor Red
}

Write-Host ""

# 5. Verificar versión de Tailwind instalada
Write-Host "5. Verificando versión de Tailwind..." -ForegroundColor Yellow
try {
    $tailwindVersion = npm list tailwindcss --depth=0 2>&1 | Select-String "tailwindcss@"
    Write-Host "   $tailwindVersion" -ForegroundColor Cyan
    if ($tailwindVersion -match "tailwindcss@3") {
        Write-Host "   ✅ Versión 3.x instalada" -ForegroundColor Green
    } elseif ($tailwindVersion -match "tailwindcss@4") {
        Write-Host "   ⚠️  Versión 4.x instalada (puede causar problemas)" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Tailwind no está instalado" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error al verificar: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ARCHIVOS CREADOS MANUALMENTE ===" -ForegroundColor Cyan
Write-Host ""

# 6. Crear archivos mínimos que SÍ funcionan
Write-Host "Creando archivos mínimos de prueba..." -ForegroundColor Yellow

# globals.css mínimo
$minimalCss = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0A0A0A;
  color: white;
}

.text-primary { color: #FFE500; }
.bg-primary { background-color: #FFE500; }
.bg-secondary { background-color: #0A0A0A; }
.bg-gray-dark { background-color: #1A1A1A; }
.border-primary { border-color: #FFE500; }
'@
[System.IO.File]::WriteAllText("$pwd\src\app\globals.css", $minimalCss, (New-Object System.Text.UTF8Encoding $false))
Write-Host "   ✅ globals.css recreado" -ForegroundColor Green

# layout.js mínimo
$minimalLayout = @'
import './globals.css'

export const metadata = {
  title: 'PreQualy M15',
  description: 'Torneo ITF',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}
'@
[System.IO.File]::WriteAllText("$pwd\src\app\layout.js", $minimalLayout, (New-Object System.Text.UTF8Encoding $false))
Write-Host "   ✅ layout.js simplificado" -ForegroundColor Green

# page.js mínimo
$minimalPage = @'
export default function Home() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">PREQUALY M15</h1>
        <p className="text-xl text-white mb-8">Torneo Profesional ITF</p>
        <button className="bg-primary text-secondary px-8 py-3 rounded-lg font-bold">
          BOTON DE PRUEBA
        </button>
      </div>
    </div>
  )
}
'@
[System.IO.File]::WriteAllText("$pwd\src\app\page.js", $minimalPage, (New-Object System.Text.UTF8Encoding $false))
Write-Host "   ✅ page.js simplificado" -ForegroundColor Green

Write-Host ""
Write-Host "=== DIAGNOSTICO COMPLETADO ===" -ForegroundColor Green
Write-Host ""
Write-Host "PASOS:" -ForegroundColor Yellow
Write-Host "1. Parar servidor (Ctrl + C)" -ForegroundColor White
Write-Host "2. Limpiar: Remove-Item -Recurse -Force .next" -ForegroundColor Cyan
Write-Host "3. Ejecutar: npm run dev" -ForegroundColor White
Write-Host "4. Abrir en modo incognito: http://localhost:3000" -ForegroundColor White
Write-Host "5. Abrir DevTools (F12) y revisar Console" -ForegroundColor White