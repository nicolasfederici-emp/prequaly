'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, User, Trophy, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function JugadoresPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'prequaly', 'qualy', 'm15_singles', 'm15_doubles'
  const router = useRouter()

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching players:', error)
    } else {
      setPlayers(data || [])
    }
    setLoading(false)
  }

  const getTournamentLabel = (tourn) => {
    switch (tourn) {
      case 'prequaly': return 'PreQualy'
      case 'qualy': return 'Qualy'
      case 'm15_singles': return 'M15 Singles'
      case 'm15_doubles': return 'M15 Dobles'
      default: return 'General'
    }
  }

  const getTournamentColorClass = (tourn) => {
    switch (tourn) {
      case 'prequaly': return 'bg-yellow-950/40 text-yellow-400 border-yellow-700/40'
      case 'qualy': return 'bg-orange-950/40 text-orange-400 border-orange-700/40'
      case 'm15_singles': return 'bg-blue-950/40 text-blue-400 border-blue-700/40'
      case 'm15_doubles': return 'bg-purple-950/40 text-purple-400 border-purple-700/40'
      default: return 'bg-gray-800 text-gray-400 border-gray-700'
    }
  }

  // Filter players by search search and selected tournament tab
  const filtered = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.club && p.club.toLowerCase().includes(search.toLowerCase()))
    
    const matchesTournament = filter === 'all' || p.tournament === filter
    
    return matchesSearch && matchesTournament
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-primary/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-primary">JUGADORES</h1>
          <p className="text-gray-400">Listado oficial de tenistas confirmados ({filtered.length})</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o club..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-dark border border-primary/30 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary" 
          />
        </div>
      </div>

      {/* Tournament Select Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-dark p-1.5 rounded-xl border border-primary/20">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 min-w-[90px] text-center py-2.5 px-3 rounded-lg font-black transition text-xs ${filter === 'all' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          TODOS
        </button>
        <button
          onClick={() => setFilter('prequaly')}
          className={`flex-1 min-w-[95px] text-center py-2.5 px-3 rounded-lg font-black transition text-xs ${filter === 'prequaly' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          PREQUALY
        </button>
        <button
          onClick={() => setFilter('qualy')}
          className={`flex-1 min-w-[95px] text-center py-2.5 px-3 rounded-lg font-black transition text-xs ${filter === 'qualy' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          QUALY
        </button>
        <button
          onClick={() => setFilter('m15_singles')}
          className={`flex-1 min-w-[100px] text-center py-2.5 px-3 rounded-lg font-black transition text-xs ${filter === 'm15_singles' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          M15 SINGLES
        </button>
        <button
          onClick={() => setFilter('m15_doubles')}
          className={`flex-1 min-w-[100px] text-center py-2.5 px-3 rounded-lg font-black transition text-xs ${filter === 'm15_doubles' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          M15 DOBLES
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-primary flex items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" /> Cargando listado de jugadores...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center text-gray-400">
          No se encontraron jugadores registrados en esta categoría.
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
                  <th className="px-6 py-4 text-primary font-bold text-xs uppercase tracking-wider">Torneo</th>
                  <th className="px-6 py-4 text-primary font-bold text-xs uppercase tracking-wider">Club / Procedencia</th>
                  <th className="px-6 py-4 text-primary font-bold text-xs uppercase tracking-wider">Mano</th>
                  <th className="px-6 py-4 text-primary font-bold text-xs uppercase tracking-wider">Edad</th>
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
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getTournamentColorClass(player.tournament)}`}>
                        {getTournamentLabel(player.tournament)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-medium text-sm">{player.club || '-'}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {player.hand === 'right' ? 'Derecha' : 'Izquierda'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{player.age} años</td>
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