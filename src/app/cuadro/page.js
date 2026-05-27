'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Printer, Calendar, Clock, Trophy, RefreshCw, X } from 'lucide-react'

export default function CuadroPage() {
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [pRes, mRes] = await Promise.all([
      supabase.from('players').select('*'),
      supabase.from('matches').select(`
        *,
        player1:player1_id (id, name, club, photo_url),
        player2:player2_id (id, name, club, photo_url)
      `).order('match_number', { ascending: true })
    ])

    if (pRes.error) console.error('Players Error:', pRes.error)
    else setPlayers(pRes.data || [])

    if (mRes.error) console.error('Matches Error:', mRes.error)
    else setMatches(mRes.data || [])

    setLoading(false)
  }

  const getRoundName = (roundNum) => {
    switch (roundNum) {
      case 1: return 'Ronda 1 (R48)'
      case 2: return 'Ronda 2 (R32)'
      case 3: return 'Octavos'
      case 4: return 'Cuartos'
      case 5: return 'Semifinales'
      case 6: return 'Final'
      default: return `Ronda ${roundNum}`
    }
  }

  // Group matches by round
  const matchesByRound = {}
  for (let r = 1; r <= 6; r++) {
    matchesByRound[r] = matches.filter(m => m.round === r)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-primary flex items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span>Cargando cuadro del torneo...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header (Hidden on Print) */}
      <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-6 print:hidden">
        <div>
          <h1 className="text-4xl font-bold text-primary">CUADRO DEL TORNEO</h1>
          <p className="text-gray-400">Camino al ITF M15 - Eliminación Directa</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-secondary px-5 py-2.5 rounded-lg font-bold hover:bg-yellow-400 transition shadow-md"
        >
          <Printer className="w-5 h-5" />
          Imprimir Cuadro
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center max-w-xl mx-auto">
          <Trophy className="w-16 h-16 text-primary/40 mx-auto mb-4" />
          <p className="text-xl text-gray-300 mb-2">El cuadro aún no ha sido generado por la organización.</p>
          <p className="text-gray-500 text-sm">Los cruces y byes aparecerán automáticamente una vez iniciado el sorteo del torneo.</p>
        </div>
      ) : (
        /* Bracket Layout Container */
        <div className="overflow-x-auto pb-8 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-secondary">
          <div className="flex gap-8 min-w-[1500px] py-4">
            
            {/* Rounds Column Render */}
            {[1, 2, 3, 4, 5, 6].map(roundNum => {
              const roundMatches = matchesByRound[roundNum] || []
              return (
                <div key={roundNum} className="flex-1 flex flex-col justify-around min-w-[240px]">
                  {/* Round Header (Hidden on Print if we want to save space, but useful to keep) */}
                  <div className="text-center bg-gray-900 border border-primary/20 py-2 rounded-lg mb-6 font-bold text-primary text-sm uppercase tracking-wider">
                    {getRoundName(roundNum)}
                  </div>

                  {/* Matches list for this round */}
                  <div className="flex-1 flex flex-col justify-around gap-6 py-2">
                    {roundMatches.map(match => {
                      const isCompleted = match.status === 'completed'
                      const isLive = match.status === 'live'

                      return (
                        <div 
                          key={match.id}
                          onClick={() => setSelectedMatch(match)}
                          className={`bg-gray-dark border rounded-xl overflow-hidden shadow-lg transition cursor-pointer hover:border-primary/60 group ${
                            isLive ? 'border-yellow-400 ring-1 ring-yellow-400/50' : 'border-primary/10'
                          }`}
                        >
                          {/* Live Indicator Bar */}
                          {isLive && (
                            <div className="bg-yellow-400 text-black text-[10px] font-bold text-center py-0.5 tracking-widest uppercase">
                              En Vivo
                            </div>
                          )}

                          {/* Player 1 Row */}
                          <div className={`flex justify-between items-center px-4 py-2.5 border-b border-secondary/40 ${
                            isCompleted && match.winner_id === match.player1_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
                          }`}>
                            <span className="truncate text-sm max-w-[150px] group-hover:text-white transition">
                              {match.player1?.name || (roundNum === 1 ? 'BYE / Vacante' : 'A confirmar')}
                            </span>
                            <span className="font-mono text-sm font-bold ml-2">
                              {isCompleted && match.score1 ? match.score1 : isLive ? '🎾' : ''}
                            </span>
                          </div>

                          {/* Player 2 Row */}
                          <div className={`flex justify-between items-center px-4 py-2.5 ${
                            isCompleted && match.winner_id === match.player2_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
                          }`}>
                            <span className="truncate text-sm max-w-[150px] group-hover:text-white transition">
                              {match.player2?.name || (roundNum === 1 ? 'BYE / Vacante' : 'A confirmar')}
                            </span>
                            <span className="font-mono text-sm font-bold ml-2">
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
              {/* Player 1 details */}
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

              {/* Player 2 details */}
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
                  <strong>Estado:</strong> {
                    selectedMatch.status === 'completed' ? 'Finalizado' :
                    selectedMatch.status === 'live' ? 'Jugándose en Vivo' : 'Programado'
                  }
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