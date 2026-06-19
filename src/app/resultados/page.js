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
              <div key={dateStr} className="space-y-6 mb-12">
                {/* Header matching the requested design */}
                <div className="bg-gray-dark rounded-t-xl pb-6 pt-8 px-4 text-center border-b-4 border-primary shadow-lg">
                  <h2 className="text-3xl md:text-5xl font-black text-primary tracking-wider mb-4" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                    {tournament.toUpperCase().replace('_', ' ')} - VERSUS
                  </h2>
                  <h3 className="text-xl md:text-3xl font-bold text-white tracking-widest mb-2 uppercase" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                    {tournament === 'prequaly' ? 'CLUB EMPALME CENTRAL' : 'CLUB NÁUTICO VILLA CONSTITUCIÓN'}
                  </h3>
                  <h4 className="text-lg md:text-2xl font-bold text-gray-300 tracking-widest uppercase" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                    DIA {dateStr}
                  </h4>
                </div>
                
                {/* Table Header Row */}
                <div className="bg-primary rounded-lg px-4 py-3 flex items-center justify-between text-secondary font-black uppercase text-sm md:text-lg tracking-wider shadow-md">
                  <div className="flex-1 text-center pr-8 md:pr-32">VS</div>
                  <div className="flex gap-4 md:gap-6 w-32 md:w-48 justify-end">
                    <span className="w-16 md:w-20 text-center">HORA</span>
                    <span className="w-16 md:w-20 text-center">CANCHA</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {dateMatches.map(match => {
                    const isCompleted = match.status === 'completed'
                    // Clean names (e.g. "Medus, Andres" instead of "Andres Medus" if preferred, but we will just uppercase it)
                    const p1Name = match.player1?.name ? match.player1.name.toUpperCase() : 'A CONFIRMAR'
                    const p2Name = match.player2?.name ? match.player2.name.toUpperCase() : 'A CONFIRMAR'
                    
                    const timeStr = match.scheduled_date ? new Date(match.scheduled_date).toLocaleTimeString('es-AR', {
                      timeZone: 'America/Argentina/Buenos_Aires',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }) : '--:--'
                    
                    // Extract just the number from "Cancha 1", etc.
                    const courtNum = match.court ? match.court.replace(/cancha\s*/i, '').trim() : '-'

                    return (
                      <div key={match.id} className="bg-gray-dark rounded-xl p-3 md:p-4 flex flex-col md:flex-row items-stretch gap-3 md:gap-4 border border-primary/20 shadow-md relative overflow-hidden">
                        
                        {/* Overlay for completed matches */}
                        {isCompleted && (
                          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center pointer-events-none">
                            <div className="bg-green-500 text-secondary px-6 py-2 rounded-full font-black text-xl tracking-widest transform -rotate-12 border-2 border-secondary shadow-xl">
                              FINALIZADO
                            </div>
                          </div>
                        )}

                        {/* Players Column */}
                        <div className="flex-1 flex flex-col gap-2 w-full z-0">
                          <div className="bg-secondary border border-primary/20 rounded-lg flex items-center px-4 py-3 md:py-4 shadow-inner">
                            <span className="text-white font-bold tracking-wide flex-1 text-sm md:text-lg">
                              {p1Name}
                            </span>
                            {isCompleted && <span className="font-black text-primary text-lg ml-2">{match.score1}</span>}
                          </div>
                          <div className="bg-secondary border border-primary/20 rounded-lg flex items-center px-4 py-3 md:py-4 shadow-inner">
                            <span className="text-white font-bold tracking-wide flex-1 text-sm md:text-lg">
                              {p2Name}
                            </span>
                            {isCompleted && <span className="font-black text-primary text-lg ml-2">{match.score2}</span>}
                          </div>
                        </div>
                        
                        {/* Time & Court Columns */}
                        <div className="flex gap-3 md:gap-6 w-full md:w-auto z-0">
                          <div className="bg-secondary border border-primary/20 rounded-lg flex items-center justify-center flex-1 md:w-20 py-3 shadow-inner">
                            <span className="text-white font-bold text-lg md:text-2xl">
                              {timeStr}
                            </span>
                          </div>
                          <div className="bg-secondary border border-primary/20 rounded-lg flex items-center justify-center flex-1 md:w-20 py-3 shadow-inner">
                            <span className="text-white font-bold text-lg md:text-2xl">
                              {courtNum}
                            </span>
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