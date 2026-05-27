@echo off
chcp 65001 >nul
echo ==========================================
echo REPARACION DE CONFIGURACION TAILWIND
echo ==========================================
echo.

:: 1. Borrar cache de Next.js
if exist .next (
    echo Borrando cache...
    rmdir /s /q .next
)

:: 2. Recrear globals.css limpio
echo Creando globals.css...
echo @tailwind base; > src\app\globals.css
echo @tailwind components; >> src\app\globals.css
echo @tailwind utilities; >> src\app\globals.css

:: 3. Recrear tailwind.config.js limpio
echo Creando tailwind.config.js...
(
echo /** @type {import('tailwindcss').Config} */
echo module.exports = {
echo   content: [
echo     './src/**/*.{js,ts,jsx,tsx,mdx}',
echo   ],
echo   theme: { extend: {} },
echo   plugins: [],
echo }
) > tailwind.config.js

:: 4. Recrear postcss.config.js limpio
echo Creando postcss.config.js...
(
echo module.exports = {
echo   plugins: {
echo     tailwindcss: {},
echo     autoprefixer: {},
echo   },
echo }
) > postcss.config.js

:: 5. Forzar Tailwind v3 (la compatible con Next.js 14)
echo.
echo Verificando Tailwind v3...
call npm uninstall tailwindcss
call npm install -D tailwindcss@3.4.1 postcss autoprefixer

echo.
echo ==========================================
echo HECHO.
echo ==========================================
echo.
echo AHORA:
echo 1. Cerra esta ventana.
echo 2. Seguí el PASO 2 (actualizar layout.js y page.js).
pause