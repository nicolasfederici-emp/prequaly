'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, Calendar, Trophy, RefreshCw } from 'lucide-react'

export default function ResultadosPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'upcoming', 'completed'

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id (id, name, club),
        player2:player2_id (id, name, club)
      `)
      .order('round', { ascending: true })
      .order('match_number', { ascending: true })

    if (error) console.error('Error fetching matches:', error)
    else setMatches(data || [])
    setLoading(false)
  }

  const getRoundName = (roundNum) => {
    switch (roundNum) {
      case 1: return 'Ronda de 48 (Ronda 1)'
      case 2: return 'Ronda de 32 (Ronda 2)'
      case 3: return 'Octavos de Final'
      case 4: return 'Cuartos de Final'
      case 5: return 'Semifinales'
      case 6: return 'Final'
      default: return `Ronda ${roundNum}`
    }
  }

  const filteredMatches = matches.filter(m => {
    if (filter === 'completed') return m.status === 'completed'
    if (filter === 'upcoming') return m.status === 'scheduled' || m.status === 'live'
    return true
  })

  // Group filtered matches by round
  const groupedMatches = filteredMatches.reduce((groups, match) => {
    const round = match.round
    if (!groups[round]) groups[round] = []
    groups[round].push(match)
    return groups
  }, {})

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-primary flex items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span>Cargando partidos y resultados...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-primary/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-primary">PARTIDOS Y RESULTADOS</h1>
          <p className="text-gray-400">Cronograma general y resultados del torneo</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto">
          {['all', 'upcoming', 'completed'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold transition text-sm ${filter === f ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
            >
              {f === 'all' ? 'Todos' : f === 'upcoming' ? 'Próximos' : 'Finalizados'}
            </button>
          ))}
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center">
          <Trophy className="w-16 h-16 text-primary/40 mx-auto mb-4" />
          <p className="text-xl text-gray-300 mb-2">Aún no hay partidos programados.</p>
          <p className="text-gray-500 text-sm">El cronograma completo aparecerá aquí una vez que la organización genere la llave del torneo.</p>
        </div>
      ) : Object.keys(groupedMatches).length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center text-gray-400">
          No hay partidos que coincidan con el filtro seleccionado.
        </div>
      ) : (
        <div className="space-y-10">
          {Object.keys(groupedMatches).sort().map(roundStr => {
            const roundNum = parseInt(roundStr)
            const roundMatches = groupedMatches[roundNum]

            return (
              <div key={roundNum} className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b border-primary/20 pb-2">
                  {getRoundName(roundNum)}
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {roundMatches.map(match => {
                    const isCompleted = match.status === 'completed'
                    const isLive = match.status === 'live'

                    return (
                      <div key={match.id} className={`bg-gray-dark rounded-xl p-6 border transition flex flex-col justify-between ${isLive ? 'border-yellow-400 ring-1 ring-yellow-400/50' : 'border-primary/10 hover:border-primary/30'}`}>
                        <div>
                          {/* Match Header */}
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-primary font-mono">Partido #{match.match_number}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1 ${isCompleted ? 'bg-green-900/50 text-green-400' : isLive ? 'bg-yellow-950/50 text-yellow-400 border border-yellow-700 animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
                              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block animate-ping"></span>}
                              {isCompleted ? 'Finalizado' : isLive ? 'En Vivo' : 'Programado'}
                            </span>
                          </div>

                          {/* Players Score Table */}
                          <div className="space-y-3 mb-6">
                            {/* Player 1 */}
                            <div className="flex justify-between items-center">
                              <div>
                                <span className={`font-bold ${isCompleted && match.winner_id === match.player1_id ? 'text-primary text-base' : 'text-white'}`}>
                                  {match.player1?.name || 'Rival a confirmar'}
                                </span>
                                {match.player1?.club && (
                                  <span className="text-xs text-gray-500 block">{match.player1.club}</span>
                                )}
                              </div>
                              <span className="font-mono text-lg font-bold bg-secondary/80 px-2 py-1 rounded text-primary">
                                {isCompleted && match.score1 ? match.score1 : '-'}
                              </span>
                            </div>

                            {/* Player 2 */}
                            <div className="flex justify-between items-center">
                              <div>
                                <span className={`font-bold ${isCompleted && match.winner_id === match.player2_id ? 'text-primary text-base' : 'text-white'}`}>
                                  {match.player2?.name || 'Rival a confirmar'}
                                </span>
                                {match.player2?.club && (
                                  <span className="text-xs text-gray-500 block">{match.player2.club}</span>
                                )}
                              </div>
                              <span className="font-mono text-lg font-bold bg-secondary/80 px-2 py-1 rounded text-primary">
                                {isCompleted && match.score2 ? match.score2 : '-'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Match Footer */}
                        <div className="border-t border-primary/10 pt-4 flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary" />
                            {match.scheduled_date ? new Date(match.scheduled_date).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit'
                            }) : 'Sin fecha'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-primary" />
                            {match.scheduled_date ? new Date(match.scheduled_date).toLocaleTimeString('es-AR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) + ' hs' : 'Sin hora'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}