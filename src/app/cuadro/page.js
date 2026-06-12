'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Printer, Calendar, Clock, Trophy, RefreshCw, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Bracket from '@/components/Bracket'

// ── Main Cuadro Content ──
function CuadroContent() {
  const searchParams = useSearchParams()
  const [tournament, setTournament] = useState('prequaly')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [collapsedRounds, setCollapsedRounds] = useState({})

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

    if (error) console.error('Matches Error:', error)
    else setMatches(data || [])
    setLoading(false)
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

  const handlePrint = () => window.print()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ═══════ Header ═══════ */}
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

      {/* ═══════ Tournament Tabs ═══════ */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-dark p-1.5 rounded-xl border border-primary/20 print:hidden">
        {[
          { key: 'prequaly', label: '🏆 PREQUALY (48)' },
          { key: 'qualy', label: '⚡ QUALY (32)' },
          { key: 'm15_singles', label: '🎾 M15 SINGLES (32)' },
          { key: 'm15_doubles', label: '👥 M15 DOBLES (16)' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTournament(t.key); setCollapsedRounds({}) }}
            className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-lg font-black transition-all text-sm ${
              tournament === t.key ? 'bg-primary text-secondary shadow-lg' : 'text-gray-400 hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-primary flex items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" /> Cargando cruces del cuadro...
        </div>
          <Bracket tournament={tournament} matches={matches} onMatchClick={setSelectedMatch} />
      )}

      {/* ═══════ MATCH DETAIL MODAL ═══════ */}
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

            {/* Players */}
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

            {/* Schedule */}
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>
                  <strong>Estado:</strong> {
                    selectedMatch.status === 'completed'
                      ? 'Finalizado'
                      : selectedMatch.status === 'scheduled'
                      ? 'Programado'
                      : 'Pendiente'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>
                  <strong>Programación:</strong> {
                    selectedMatch.scheduled_date
                      ? new Date(selectedMatch.scheduled_date).toLocaleString('es-AR', {
                          weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                        })
                      : 'Fecha no especificada'
                  }
                </span>
              </div>
            </div>

            {/* Winner */}
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