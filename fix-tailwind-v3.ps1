$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

Write-Host "Desinstalando versiones actuales..." -ForegroundColor Yellow
npm uninstall tailwindcss postcss autoprefixer

Write-Host "Instalando Tailwind CSS v3 (compatible con Next.js 14)..." -ForegroundColor Cyan
npm install -D tailwindcss@3.4.1 postcss@8.4.33 autoprefixer@10.4.17

# Asegurar que postcss.config.js use la sintaxis v3
$postcssContent = @"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@
[System.IO.File]::WriteAllText("$pwd\postcss.config.js", $postcssContent, $utf8NoBom)

Write-Host ""
Write-Host "✅ Tailwind v3 instalado y configurado correctamente." -ForegroundColor Green
Write-Host ""
Write-Host "=== PASOS SIGUIENTES ===" -ForegroundColor Yellow
Write-Host "1. Parar el servidor (Ctrl + C)" -ForegroundColor White
Write-Host "2. Limpiar caché de Webpack/Next.js:" -ForegroundColor White
Write-Host "   Remove-Item -Recurse -Force .next" -ForegroundColor Cyan
Write-Host "3. Reiniciar: npm run dev" -ForegroundColor White
Write-Host "4. Abrir en modo incógnito: http://localhost:3000" -ForegroundColor White