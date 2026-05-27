$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# 1. Forzar encoding en layout.js con meta charset explícito
$layoutContent = @'
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
    <html lang="es" charSet="utf-8">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
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

# 2. Reemplazar admin/page.js con ABM completo (CRUD)
$adminContent = @'
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Trash2, Edit, Save, X, Plus } from 'lucide-react'

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState('')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', age: '', hand: 'right', club: '', paid: false })

  const login = (e) => {
    e.preventDefault()
    if (pass === 'admin123') {
      setAuth(true)
      fetchPlayers()
    } else {
      setMsg('Contraseña incorrecta')
    }
  }

  const fetchPlayers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('players').select('*').order('name')
    if (error) console.error('Error:', error)
    else setPlayers(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setForm({ name: '', age: '', hand: 'right', club: '', paid: false })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const playerData = {
      name: form.name,
      age: parseInt(form.age),
      hand: form.hand,
      club: form.club,
      paid: form.paid
    }

    let error
    if (editingId) {
      // UPDATE
      const result = await supabase.from('players').update(playerData).eq('id', editingId)
      error = result.error
    } else {
      // INSERT
      const result = await supabase.from('players').insert([playerData])
      error = result.error
    }

    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg(editingId ? 'Jugador actualizado' : 'Jugador cargado')
      resetForm()
      fetchPlayers()
    }
    setLoading(false)
  }

  const handleEdit = (player) => {
    setForm({
      name: player.name,
      age: player.age.toString(),
      hand: player.hand,
      club: player.club || '',
      paid: player.paid
    })
    setEditingId(player.id)
    setShowForm(true)
    setMsg('')
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar a ${name}?`)) return
    
    setLoading(true)
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (error) {
      setMsg('Error al eliminar: ' + error.message)
    } else {
      setMsg('Jugador eliminado')
      fetchPlayers()
    }
    setLoading(false)
  }

  if (!auth) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-sm text-center">
        <h1 className="text-2xl font-bold text-primary mb-6">Acceso Organización</h1>
        <form onSubmit={login} className="space-y-4">
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={pass} 
            onChange={e => setPass(e.target.value)} 
            className="w-full bg-gray-dark border border-primary/30 rounded-lg px-4 py-3 text-white" 
          />
          <button className="w-full bg-primary text-secondary font-bold py-3 rounded-lg">Entrar</button>
          {msg && <p className="text-red-400">{msg}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">ABM JUGADORES</h1>
        <button 
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary text-secondary px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Jugador
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg ${msg.includes('Error') ? 'bg-red-900/30 border border-red-500' : 'bg-green-900/30 border border-green-500'}`}>
          {msg}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-dark p-6 rounded-xl border border-primary/20 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">{editingId ? 'Editar Jugador' : 'Nuevo Jugador'}</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1 text-sm">Nombre completo *</label>
              <input 
                required 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Edad *</label>
                <input 
                  required 
                  type="number" 
                  value={form.age} 
                  onChange={e => setForm({...form, age: e.target.value})} 
                  className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" 
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Mano</label>
                <select 
                  value={form.hand} 
                  onChange={e => setForm({...form, hand: e.target.value})} 
                  className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white"
                >
                  <option value="right">Derecha</option>
                  <option value="left">Izquierda</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1 text-sm">Club / Ciudad</label>
              <input 
                value={form.club} 
                onChange={e => setForm({...form, club: e.target.value})} 
                className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" 
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.paid} 
                onChange={e => setForm({...form, paid: e.target.checked})} 
                className="w-4 h-4 accent-primary" 
              />
              <span className="text-gray-300">Inscripción abonada</span>
            </label>
            <div className="flex gap-4">
              <button 
                disabled={loading} 
                type="submit"
                className="flex-1 bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-dark rounded-xl border border-primary/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-primary/20">
              <tr>
                <th className="px-4 py-3 text-left text-primary font-bold">Nombre</th>
                <th className="px-4 py-3 text-left text-primary font-bold">Edad</th>
                <th className="px-4 py-3 text-left text-primary font-bold">Mano</th>
                <th className="px-4 py-3 text-left text-primary font-bold">Club</th>
                <th className="px-4 py-3 text-left text-primary font-bold">Pago</th>
                <th className="px-4 py-3 text-center text-primary font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => (
                <tr key={player.id} className={`border-b border-gray-700 ${idx % 2 === 0 ? 'bg-gray-dark' : 'bg-gray-800/50'}`}>
                  <td className="px-4 py-3 font-bold text-white">{player.name}</td>
                  <td className="px-4 py-3 text-gray-300">{player.age}</td>
                  <td className="px-4 py-3 text-gray-300">{player.hand === 'right' ? 'Derecha' : 'Izquierda'}</td>
                  <td className="px-4 py-3 text-gray-300">{player.club || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${player.paid ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {player.paid ? 'PAGÓ' : 'PENDIENTE'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(player)}
                        className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(player.id, player.name)}
                        className="p-2 bg-red-600 hover:bg-red-500 rounded text-white transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {players.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No hay jugadores cargados. Hacé clic en "Nuevo Jugador" para comenzar.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
'@
[System.IO.File]::WriteAllText("src/app/admin/page.js", $adminContent, $utf8NoBom)

Write-Host "✅ ABM completo creado" -ForegroundColor Green
Write-Host "✅ Encoding UTF-8 forzado en layout.js" -ForegroundColor Green
Write-Host ""
Write-Host "PASOS A SEGUIR:" -ForegroundColor Yellow
Write-Host "1. Parar servidor (Ctrl + C)" -ForegroundColor White
Write-Host "2. Limpiar caché de Next.js:" -ForegroundColor White
Write-Host "   Remove-Item -Recurse -Force .next" -ForegroundColor Cyan
Write-Host "3. Ejecutar: npm run dev" -ForegroundColor White
Write-Host "4. Abrir navegador en modo incógnito o limpiar caché (Ctrl + Shift + Supr)" -ForegroundColor White
Write-Host "5. Entrar a: http://localhost:3000/admin" -ForegroundColor White
Write-Host "   Contraseña: admin123" -ForegroundColor White