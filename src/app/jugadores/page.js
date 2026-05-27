'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function JugadoresPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-primary/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-primary">JUGADORES</h1>
          <p className="text-gray-400">Listado oficial de tenistas confirmados ({players.length})</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o club..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-dark border border-primary/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary" 
          />
        </div>
      </div>
      
      {filtered.length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center text-gray-400">
          No se encontraron jugadores.
        </div>
      ) : (
        /* Compact List Table View */
        <div className="bg-gray-dark rounded-2xl border border-primary/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900 border-b border-primary/20">
                  <th className="px-6 py-4 text-primary font-bold text-xs w-12 text-center uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-primary font-bold text-xs uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-primary font-bold text-xs uppercase tracking-wider">Club / Procedencia</th>
                  <th className="px-6 py-4 text-primary font-bold text-xs uppercase tracking-wider">Mano</th>
                  <th className="px-6 py-4 text-primary font-bold text-xs uppercase tracking-wider">Edad</th>
                  <th className="px-6 py-4 text-primary font-bold text-xs uppercase tracking-wider text-center">Inscripción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((player, idx) => (
                  <tr 
                    key={player.id} 
                    onClick={() => router.push(`/jugadores/${player.id}`)}
                    className="border-b border-secondary/40 hover:bg-primary/5 transition cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-gray-500 font-mono text-center font-bold text-sm">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/10 flex-shrink-0">
                          {player.photo_url ? (
                            <img src={player.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <span className="font-bold text-white group-hover:text-primary transition">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-medium text-sm">{player.club || '-'}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {player.hand === 'right' ? 'Derecha' : 'Izquierda'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{player.age} años</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${
                        player.paid 
                          ? 'bg-green-950/20 text-green-400 border-green-500/30' 
                          : 'bg-red-950/20 text-red-400 border-red-500/30'
                      }`}>
                        {player.paid ? 'Pagada' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}