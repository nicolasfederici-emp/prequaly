'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Printer, Calendar, Clock, Trophy, RefreshCw, X, User } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function CuadroContent() {
  const searchParams = useSearchParams()
  const [tournament, setTournament] = useState('prequaly') // 'prequaly', 'qualy', 'm15_singles', 'm15_doubles'
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)

  useEffect(() => {
    const tParam = searchParams.get('torneo')
    if (tParam && ['prequaly', 'qualy', 'm15_singles', 'm15_doubles'].includes(tParam)) {
      setTournament(tParam)
    }
  }, [searchParams])

  useEffect(() => {
    fetchData()
  }, [tournament])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id (id, name, club, photo_url),
        player2:player2_id (id, name, club, photo_url)
      `)
      .eq('tournament', tournament)
      .order('match_number', { ascending: true })

    if (error) {
      console.error('Matches Error:', error)
    } else {
      setMatches(data || [])
    }
    setLoading(false)
  }

  const getRoundsForTournament = () => {
    switch (tournament) {
      case 'prequaly':
        return [1, 2, 3, 4, 5, 6]
      case 'qualy':
      case 'm15_singles':
        return [1, 2, 3, 4, 5]
      case 'm15_doubles':
        return [1, 2, 3, 4]
      default:
        return [1, 2, 3, 4, 5, 6]
    }
  }

  const getRoundName = (roundNum) => {
    if (tournament === 'prequaly') {
      switch (roundNum) {
        case 1: return 'R1 (R48)'
        case 2: return 'R2 (R32)'
        case 3: return 'Octavos'
        case 4: return 'Cuartos'
        case 5: return 'Semifinales'
        case 6: return 'Final'
        default: return `Ronda ${roundNum}`
      }
    } else if (tournament === 'qualy' || tournament === 'm15_singles') {
      switch (roundNum) {
        case 1: return 'R1 (R32)'
        case 2: return 'Octavos'
        case 3: return 'Cuartos'
        case 4: return 'Semifinales'
        case 5: return 'Final'
        default: return `Ronda ${roundNum}`
      }
    } else if (tournament === 'm15_doubles') {
      switch (roundNum) {
        case 1: return 'R1 (R16)'
        case 2: return 'Cuartos'
        case 3: return 'Semifinales'
        case 4: return 'Final'
        default: return `Ronda ${roundNum}`
      }
    }
    return `Ronda ${roundNum}`
  }

  // Group matches by round
  const matchesByRound = {}
  const rounds = getRoundsForTournament()
  rounds.forEach(r => {
    matchesByRound[r] = matches.filter(m => m.round === r)
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header (Hidden on Print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-primary/10 pb-6 print:hidden">
        <div>
          <h1 className="text-4xl font-bold text-primary">CUADROS DEL TORNEO</h1>
          <p className="text-gray-400">Selecciona el torneo para ver la llave de cruces oficial</p>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-secondary px-5 py-2.5 rounded-lg font-bold hover:bg-yellow-400 transition shadow-md w-full md:w-auto justify-center"
        >
          <Printer className="w-5 h-5" />
          Imprimir Cuadro
        </button>
      </div>

      {/* Tournament Navigation Tabs (Hidden on Print) */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-dark p-1.5 rounded-xl border border-primary/20 print:hidden">
        <button
          onClick={() => setTournament('prequaly')}
          className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg font-black transition-all text-sm ${tournament === 'prequaly' ? 'bg-primary text-secondary shadow-lg' : 'text-gray-400 hover:text-primary'}`}
        >
          🏆 PREQUALY (48)
        </button>
        <button
          onClick={() => setTournament('qualy')}
          className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg font-black transition-all text-sm ${tournament === 'qualy' ? 'bg-primary text-secondary shadow-lg' : 'text-gray-400 hover:text-primary'}`}
        >
          ⚡ QUALY (32)
        </button>
        <button
          onClick={() => setTournament('m15_singles')}
          className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg font-black transition-all text-sm ${tournament === 'm15_singles' ? 'bg-primary text-secondary shadow-lg' : 'text-gray-400 hover:text-primary'}`}
        >
          🎾 M15 SINGLES (32)
        </button>
        <button
          onClick={() => setTournament('m15_doubles')}
          className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg font-black transition-all text-sm ${tournament === 'm15_doubles' ? 'bg-primary text-secondary shadow-lg' : 'text-gray-400 hover:text-primary'}`}
        >
          👥 M15 DOBLES (16)
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-primary flex items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" /> Cargando cruces del cuadro...
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center max-w-xl mx-auto my-8">
          <Trophy className="w-16 h-16 text-primary/40 mx-auto mb-4" />
          <p className="text-xl text-gray-300 mb-2">Este cuadro aún no ha sido cargado por la organización.</p>
          <p className="text-gray-500 text-sm">Los cruces se verán reflejados tan pronto como se generen las llaves.</p>
        </div>
      ) : (
        /* Bracket Layout Container */
        <div className="overflow-x-auto pb-8 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-secondary">
          <div className="flex gap-8 min-w-[1400px] py-4">
            
            {/* Rounds Column Render */}
            {rounds.map(roundNum => {
              const roundMatches = matchesByRound[roundNum] || []
              return (
                <div key={roundNum} className="flex-1 flex flex-col justify-around min-w-[240px]">
                  {/* Round Header */}
                  <div className="text-center bg-gray-900 border border-primary/20 py-2 rounded-lg mb-6 font-bold text-primary text-xs uppercase tracking-wider">
                    {getRoundName(roundNum)}
                  </div>

                  {/* Matches list for this round */}
                  <div className="flex-1 flex flex-col justify-around gap-6 py-2">
                    {roundMatches.map(match => {
                      const isCompleted = match.status === 'completed'

                      return (
                        <div 
                          key={match.id}
                          onClick={() => setSelectedMatch(match)}
                          className="bg-gray-dark border border-primary/10 rounded-xl overflow-hidden shadow-lg transition cursor-pointer hover:border-primary/60 group"
                        >
                          {/* Player 1 Row */}
                          <div className={`flex justify-between items-center px-4 py-2.5 border-b border-secondary/40 ${
                            isCompleted && match.winner_id === match.player1_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
                          }`}>
                            <div className="flex items-center gap-2">
                              {match.player1?.photo_url ? (
                                <img src={match.player1.photo_url} alt={match.player1.name} className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-primary" />
                              )}
                              <span className="truncate text-xs max-w-[130px] group-hover:text-white transition">
                                {match.player1?.name || 'A confirmar'}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold ml-2">
                              {isCompleted && match.score1 ? match.score1 : ''}
                            </span>
                          </div>

                          {/* Player 2 Row */}
                          <div className={`flex justify-between items-center px-4 py-2.5 ${
                            isCompleted && match.winner_id === match.player2_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
                          }`}>
                            <div className="flex items-center gap-2">
                              {match.player2?.photo_url ? (
                                <img src={match.player2.photo_url} alt={match.player2.name} className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-primary" />
                              )}
                              <span className="truncate text-xs max-w-[130px] group-hover:text-white transition">
                                {match.player2?.name || 'A confirmar'}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold ml-2">
                              {isCompleted && match.score2 ? match.score2 : ''}
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
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn print:hidden">
          <div className="bg-gray-dark border border-primary/30 rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => setSelectedMatch(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-2">
              {getRoundName(selectedMatch.round)} - Partido #{selectedMatch.match_number}
            </span>
            <h3 className="text-2xl font-bold text-white mb-6">Detalles del Partido</h3>

            {/* Players vs Box */}
            <div className="space-y-4 bg-secondary/60 p-4 rounded-xl border border-primary/10 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-lg text-white">
                    {selectedMatch.player1?.name || 'Rival a confirmar'}
                  </span>
                  <span className="text-xs text-gray-400 block">
                    {selectedMatch.player1?.club || 'Club no especificado'}
                  </span>
                </div>
                <span className="font-mono text-xl font-bold text-primary">
                  {selectedMatch.status === 'completed' ? selectedMatch.score1 : ''}
                </span>
              </div>

              <div className="border-t border-primary/10 my-2"></div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-lg text-white">
                    {selectedMatch.player2?.name || 'Rival a confirmar'}
                  </span>
                  <span className="text-xs text-gray-400 block">
                    {selectedMatch.player2?.club || 'Club no especificado'}
                  </span>
                </div>
                <span className="font-mono text-xl font-bold text-primary">
                  {selectedMatch.status === 'completed' ? selectedMatch.score2 : ''}
                </span>
              </div>
            </div>

            {/* Scheduling Info */}
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>
                  <strong>Estado:</strong> {selectedMatch.status === 'completed' ? 'Finalizado' : 'Programado'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>
                  <strong>Programación:</strong> {
                    selectedMatch.scheduled_date ? new Date(selectedMatch.scheduled_date).toLocaleString('es-AR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Fecha no especificada'
                  }
                </span>
              </div>
            </div>

            {/* Winner Badge */}
            {selectedMatch.status === 'completed' && selectedMatch.winner_id && (
              <div className="mt-6 p-3 bg-green-950/20 border border-green-500/30 rounded-lg text-center text-green-400 font-bold">
                🏆 GANADOR: {
                  selectedMatch.winner_id === selectedMatch.player1_id 
                    ? selectedMatch.player1?.name 
                    : selectedMatch.player2?.name
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CuadroPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center text-primary">Cargando cuadros...</div>}>
      <CuadroContent />
    </Suspense>
  )
}