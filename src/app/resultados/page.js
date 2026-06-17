'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, Calendar, Trophy, RefreshCw, LayoutGrid, List } from 'lucide-react'
import Bracket from '@/components/Bracket'

export default function ResultadosPage() {
  const [tournament, setTournament] = useState('prequaly') // 'prequaly', 'qualy', 'm15_singles', 'm15_doubles'
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming') // 'upcoming', 'completed', 'all'
  const [viewMode, setViewMode] = useState('cronograma') // 'cronograma' | 'cuadro'
  const [selectedDateFilter, setSelectedDateFilter] = useState('all')

  useEffect(() => {
    fetchMatches()
  }, [tournament])

  useEffect(() => {
    setSelectedDateFilter('all')
  }, [tournament, filter])

  const fetchMatches = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id (id, name, club, photo_url),
        player2:player2_id (id, name, club, photo_url)
      `)
      .eq('tournament', tournament)
      .order('round', { ascending: true })
      .order('match_number', { ascending: true })

    if (error) {
      console.error('Error fetching matches:', error)
    } else {
      setMatches(data || [])
    }
    setLoading(false)
  }

  const getRoundName = (roundNum) => {
    if (tournament === 'prequaly') {
      switch (roundNum) {
        case 1: return 'Ronda 1 (R48)'
        case 2: return 'Ronda 2 (R32)'
        case 3: return 'Octavos de Final'
        case 4: return 'Cuartos de Final'
        case 5: return 'Semifinales'
        case 6: return 'Final'
        default: return `Ronda ${roundNum}`
      }
    } else if (tournament === 'qualy' || tournament === 'm15_singles') {
      switch (roundNum) {
        case 1: return 'Ronda 1 (R32)'
        case 2: return 'Octavos de Final'
        case 3: return 'Cuartos de Final'
        case 4: return 'Semifinales'
        case 5: return 'Final'
        default: return `Ronda ${roundNum}`
      }
    } else if (tournament === 'm15_doubles') {
      switch (roundNum) {
        case 1: return 'Ronda 1 (R16)'
        case 2: return 'Cuartos de Final'
        case 3: return 'Semifinales'
        case 4: return 'Final'
        default: return `Ronda ${roundNum}`
      }
    }
    return `Ronda ${roundNum}`
  }

  // Filter: only show matches with dates or completed ones.
  // "Programados" means ANY match (pending or scheduled) that has a valid scheduled_date.
  const filteredMatches = matches.filter(m => {
    const hasDate = m.scheduled_date && m.scheduled_date.trim() !== ''
    if (filter === 'completed') return m.status === 'completed'
    if (filter === 'upcoming') return m.status !== 'completed' && hasDate
    return m.status === 'completed' || (m.status !== 'completed' && hasDate)
  })

  // Group filtered matches by date
  const groupedMatches = filteredMatches.reduce((groups, match) => {
    let dateStr = 'A Confirmar'
    if (match.scheduled_date) {
      try {
        const d = new Date(match.scheduled_date)
        dateStr = d.toLocaleDateString('es-AR', { 
          timeZone: 'America/Argentina/Buenos_Aires', 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })
        dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1) // Capitalize first letter
      } catch (e) {
        dateStr = 'Fecha inválida'
      }
    }
    
    if (!groups[dateStr]) groups[dateStr] = []
    groups[dateStr].push(match)
    return groups
  }, {})

  // Sort matches inside each group by time, then round, then match_number
  Object.keys(groupedMatches).forEach(dateStr => {
    groupedMatches[dateStr].sort((a, b) => {
      const timeA = a.scheduled_date ? new Date(a.scheduled_date).getTime() : Infinity
      const timeB = b.scheduled_date ? new Date(b.scheduled_date).getTime() : Infinity
      if (timeA !== timeB) return timeA - timeB
      if (a.round !== b.round) return a.round - b.round
      return a.match_number - b.match_number
    })
  })

  // Sort groups (A Confirmar last)
  const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
    if (a === 'A Confirmar') return 1
    if (b === 'A Confirmar') return -1
    // Parse back if needed, but for simplicity sorting by string representation might not be chronological.
    // Better to sort by the first match's actual date in that group
    const timeA = new Date(groupedMatches[a][0].scheduled_date).getTime() || Infinity
    const timeB = new Date(groupedMatches[b][0].scheduled_date).getTime() || Infinity
    return timeA - timeB
  })

  const displayDates = selectedDateFilter === 'all' ? sortedDates : sortedDates.filter(d => d === selectedDateFilter)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-primary/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-primary">PROGRAMACIÓN Y CUADROS</h1>
          <p className="text-gray-400">Cronograma oficial y llaves del torneo</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex gap-2 w-full md:w-auto bg-gray-dark p-1 rounded-lg border border-primary/20">
          <button 
            onClick={() => setViewMode('cronograma')} 
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-bold transition text-xs ${viewMode === 'cronograma' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
          >
            <List className="w-4 h-4" /> Cronograma
          </button>
          <button 
            onClick={() => setViewMode('cuadro')} 
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-bold transition text-xs ${viewMode === 'cuadro' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Cuadro
          </button>
        </div>
      </div>

      {/* Tournament Selection Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-dark p-1.5 rounded-xl border border-primary/20">
        <button
          onClick={() => setTournament('prequaly')}
          className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg font-black transition-all text-xs ${tournament === 'prequaly' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          PREQUALY
        </button>
        <button
          onClick={() => setTournament('qualy')}
          className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg font-black transition-all text-xs ${tournament === 'qualy' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          QUALY
        </button>
        <button
          onClick={() => setTournament('m15_singles')}
          className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg font-black transition-all text-xs ${tournament === 'm15_singles' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          M15 SINGLES
        </button>
        <button
          onClick={() => setTournament('m15_doubles')}
          className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg font-black transition-all text-xs ${tournament === 'm15_doubles' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          M15 DOBLES
        </button>
      </div>

      {viewMode === 'cronograma' && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2 w-full md:w-auto">
            {['upcoming', 'completed', 'all'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                className={`px-4 py-2 rounded-lg font-bold transition text-xs ${filter === f ? 'bg-secondary text-primary border border-primary' : 'bg-gray-dark text-gray-400 border border-transparent hover:text-primary'}`}
              >
                {f === 'all' ? 'Todos' : f === 'upcoming' ? 'Programados' : 'Finalizados'}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          {sortedDates.length > 0 && (
            <div className="flex gap-2 w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20">
              <button
                onClick={() => setSelectedDateFilter('all')}
                className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition text-xs ${selectedDateFilter === 'all' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-400 border border-transparent hover:text-primary'}`}
              >
                Todos los días
              </button>
              {sortedDates.map(dateStr => (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateFilter(dateStr)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold transition text-xs ${selectedDateFilter === dateStr ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-400 border border-transparent hover:text-primary'}`}
                >
                  {dateStr}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-primary flex items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" /> Cargando datos...
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center my-8">
          <Trophy className="w-16 h-16 text-primary/40 mx-auto mb-4" />
          <p className="text-xl text-gray-300 mb-2">Aún no hay partidos programados para este torneo.</p>
        </div>
      ) : viewMode === 'cuadro' ? (
        <div className="bg-gray-dark p-4 md:p-6 rounded-2xl border border-primary/10 overflow-hidden">
          <Bracket tournament={tournament} matches={matches} />
        </div>
      ) : displayDates.length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center text-gray-400 my-8">
          No hay partidos en este torneo que coincidan con el filtro seleccionado.
        </div>
      ) : (
        <div className="space-y-10">
          {displayDates.map(dateStr => {
            const dateMatches = groupedMatches[dateStr]

            return (
              <div key={dateStr} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-primary/20 pb-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-primary">
                    {dateStr}
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {dateMatches.map(match => {
                    const isCompleted = match.status === 'completed'

                    return (
                      <div key={match.id} className="bg-gray-dark rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition flex flex-col justify-between">
                        <div>
                          {/* Match Header */}
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-primary font-mono font-bold">{getRoundName(match.round)} - #{match.match_number}</span>
                            <span className={`text-xs px-2.5 py-0.5 rounded font-bold border ${isCompleted ? 'bg-green-950/20 text-green-400 border-green-500/20' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                              {isCompleted ? 'Finalizado' : 'Programado'}
                            </span>
                          </div>

                          {/* Players Score */}
                          <div className="space-y-3 mb-6">
                            {/* Player 1 */}
                            <div className="flex justify-between items-center">
                              <div>
                                <span className={`font-bold ${isCompleted && match.winner_id === match.player1_id ? 'text-primary text-base' : 'text-white'}`}>
                                  {match.player1?.name || 'A confirmar'}
                                </span>
                                {match.player1?.club && (
                                  <span className="text-xs text-gray-500 block">{match.player1.club}</span>
                                )}
                              </div>
                              <span className="font-mono text-base font-bold bg-secondary/80 px-2.5 py-1 rounded text-primary">
                                {isCompleted && match.score1 ? match.score1 : '-'}
                              </span>
                            </div>

                            {/* Player 2 */}
                            <div className="flex justify-between items-center">
                              <div>
                                <span className={`font-bold ${isCompleted && match.winner_id === match.player2_id ? 'text-primary text-base' : 'text-white'}`}>
                                  {match.player2?.name || 'A confirmar'}
                                </span>
                                {match.player2?.club && (
                                  <span className="text-xs text-gray-500 block">{match.player2.club}</span>
                                )}
                              </div>
                              <span className="font-mono text-base font-bold bg-secondary/80 px-2.5 py-1 rounded text-primary">
                                {isCompleted && match.score2 ? match.score2 : '-'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Match Footer */}
                        <div className="border-t border-primary/10 pt-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-primary">
                              <Clock className="w-5 h-5" />
                              <span className="text-xl font-bold">
                                {match.scheduled_date ? new Date(match.scheduled_date).toLocaleTimeString('es-AR', {
                                  timeZone: 'America/Argentina/Buenos_Aires',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                }) + ' hs' : 'Sin hora'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {match.scheduled_date ? (() => {
                                  let dStr = new Date(match.scheduled_date).toLocaleDateString('es-AR', {
                                    timeZone: 'America/Argentina/Buenos_Aires',
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'short'
                                  });
                                  return dStr.charAt(0).toUpperCase() + dStr.slice(1);
                                })() : 'A confirmar'}
                              </span>
                            </div>
                          </div>
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