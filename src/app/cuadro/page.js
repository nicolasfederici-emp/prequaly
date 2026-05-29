'use client'
import { useEffect, useState, Suspense, Fragment } from 'react'
import { supabase } from '@/lib/supabase'
import { Printer, Calendar, Clock, Trophy, RefreshCw, X, User, ChevronDown, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

// ── Bracket Layout Constants ──
const MATCH_H = 44   // match card fixed height (px)
const GAP = 6        // vertical gap between base slots
const SLOT_BASE = MATCH_H + GAP  // 50px per slot in the densest round
const HEADER_H = 28  // round header height
const CONN_W = 28    // connector column width
const COL_MIN_W = 180 // minimum column width

// ── Match Card (compact, fixed-height) ──
function MatchCard({ match, onClick }) {
  const done = match.status === 'completed'
  return (
    <div
      onClick={() => onClick(match)}
      className="bg-gray-dark border border-primary/10 rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition h-full flex flex-col"
    >
      {/* Player 1 */}
      <div className={`flex-1 flex justify-between items-center px-2.5 border-b border-secondary/30 ${
        done && match.winner_id === match.player1_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {match.player1?.photo_url
            ? <img src={match.player1.photo_url} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
            : <User className="w-3.5 h-3.5 text-primary/40 shrink-0" />
          }
          <span className="truncate text-[11px] max-w-[105px]">
            {match.player1?.name || 'A confirmar'}
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold ml-1 shrink-0">
          {done && match.score1 ? match.score1 : ''}
        </span>
      </div>
      {/* Player 2 */}
      <div className={`flex-1 flex justify-between items-center px-2.5 ${
        done && match.winner_id === match.player2_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {match.player2?.photo_url
            ? <img src={match.player2.photo_url} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
            : <User className="w-3.5 h-3.5 text-primary/40 shrink-0" />
          }
          <span className="truncate text-[11px] max-w-[105px]">
            {match.player2?.name || 'A confirmar'}
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold ml-1 shrink-0">
          {done && match.score2 ? match.score2 : ''}
        </span>
      </div>
    </div>
  )
}

// ── SVG Bracket Connector ──
function SvgConnector({ prevCount, nextCount, prevSlotH, totalH }) {
  if (prevCount === 0 || nextCount === 0) return <div style={{ width: CONN_W }} />

  const lines = []
  const strokeColor = 'rgba(208,253,62,0.3)'

  if (prevCount === nextCount * 2) {
    // 2:1 merge — two matches feed into one
    for (let j = 0; j < nextCount; j++) {
      const y1 = (j * 2) * prevSlotH + prevSlotH / 2
      const y2 = (j * 2 + 1) * prevSlotH + prevSlotH / 2
      const yMid = (y1 + y2) / 2
      const xMid = CONN_W / 2

      lines.push(
        <path
          key={`m-${j}`}
          d={`M 0 ${y1} H ${xMid} V ${y2} H 0 M ${xMid} ${yMid} H ${CONN_W}`}
          stroke={strokeColor}
          strokeWidth="1.5"
          fill="none"
        />
      )
    }
  } else if (prevCount === nextCount) {
    // 1:1 pass-through
    for (let i = 0; i < prevCount; i++) {
      const y = i * prevSlotH + prevSlotH / 2
      lines.push(
        <line
          key={`p-${i}`}
          x1={0} y1={y} x2={CONN_W} y2={y}
          stroke={strokeColor}
          strokeWidth="1"
          strokeDasharray="4 3"
        />
      )
    }
  }

  return (
    <div className="shrink-0 flex flex-col" style={{ width: CONN_W }}>
      {/* Spacer to align with header + gap */}
      <div style={{ height: HEADER_H + GAP }} />
      <svg width={CONN_W} height={totalH} className="block overflow-visible">
        {lines}
      </svg>
    </div>
  )
}

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

  const getRoundsForTournament = () => {
    switch (tournament) {
      case 'prequaly': return [1, 2, 3, 4, 5, 6]
      case 'qualy':
      case 'm15_singles': return [1, 2, 3, 4, 5]
      case 'm15_doubles': return [1, 2, 3, 4]
      default: return [1, 2, 3, 4, 5, 6]
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

  const toggleRound = (roundNum) => {
    setCollapsedRounds(prev => ({ ...prev, [roundNum]: !prev[roundNum] }))
  }

  // Group matches by round
  const rounds = getRoundsForTournament()
  const matchesByRound = {}
  rounds.forEach(r => { matchesByRound[r] = matches.filter(m => m.round === r) })

  const firstRoundCount = matchesByRound[rounds[0]]?.length || 1
  const totalBracketH = firstRoundCount * SLOT_BASE

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
      ) : matches.length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center max-w-xl mx-auto my-8">
          <Trophy className="w-16 h-16 text-primary/40 mx-auto mb-4" />
          <p className="text-xl text-gray-300 mb-2">Este cuadro aún no ha sido cargado por la organización.</p>
          <p className="text-gray-500 text-sm">Los cruces se verán reflejados tan pronto como se generen las llaves.</p>
        </div>
      ) : (
        <>
          {/* ═══════ DESKTOP BRACKET (horizontal with SVG connectors) ═══════ */}
          <div className="hidden md:block overflow-x-auto pb-8 -mx-4 px-4 print:block">
            <div
              className="flex items-start"
              style={{ minWidth: rounds.length * COL_MIN_W + (rounds.length - 1) * CONN_W }}
            >
              {rounds.map((roundNum, roundIdx) => {
                const roundMatches = matchesByRound[roundNum] || []
                const count = roundMatches.length || 1
                const multiplier = firstRoundCount / count
                const slotH = SLOT_BASE * multiplier

                const isFirst = roundIdx === 0
                const isLast = roundIdx === rounds.length - 1
                const nextRound = rounds[roundIdx + 1]
                const nextMatches = nextRound ? (matchesByRound[nextRound] || []) : []

                return (
                  <Fragment key={roundNum}>
                    {/* ── Round Column ── */}
                    <div style={{ minWidth: COL_MIN_W, flex: '1 1 0' }}>
                      {/* Header */}
                      <div
                        className="text-center bg-gray-900 border border-primary/20 rounded-lg font-bold text-primary text-[11px] uppercase tracking-wider flex items-center justify-center select-none"
                        style={{ height: HEADER_H }}
                      >
                        {getRoundName(roundNum)}
                      </div>

                      {/* Match Slots */}
                      <div className="flex flex-col" style={{ marginTop: GAP }}>
                        {roundMatches.map(match => (
                          <div
                            key={match.id}
                            className="flex items-center"
                            style={{ height: slotH }}
                          >
                            {/* Left input stub (connects to connector) */}
                            {!isFirst && (
                              <div
                                className="shrink-0"
                                style={{
                                  width: 8,
                                  height: 0,
                                  borderTop: '1.5px solid rgba(208,253,62,0.3)'
                                }}
                              />
                            )}

                            {/* Match Card */}
                            <div className="flex-1 min-w-0" style={{ height: MATCH_H }}>
                              <MatchCard match={match} onClick={setSelectedMatch} />
                            </div>

                            {/* Right output stub (connects to connector) */}
                            {!isLast && (
                              <div
                                className="shrink-0"
                                style={{
                                  width: 8,
                                  height: 0,
                                  borderTop: '1.5px solid rgba(208,253,62,0.3)'
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── SVG Connector Lines ── */}
                    {!isLast && (
                      <SvgConnector
                        prevCount={roundMatches.length}
                        nextCount={nextMatches.length}
                        prevSlotH={slotH}
                        totalH={totalBracketH}
                      />
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>

          {/* ═══════ MOBILE VIEW (vertical accordion) ═══════ */}
          <div className="md:hidden space-y-3 print:hidden">
            {rounds.map(roundNum => {
              const roundMatches = matchesByRound[roundNum] || []
              const isCollapsed = collapsedRounds[roundNum]

              return (
                <div key={roundNum} className="bg-gray-dark border border-primary/15 rounded-xl overflow-hidden">
                  {/* Round Header */}
                  <button
                    onClick={() => toggleRound(roundNum)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-primary/10 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed
                        ? <ChevronRight className="w-4 h-4 text-primary" />
                        : <ChevronDown className="w-4 h-4 text-primary" />
                      }
                      <span className="font-bold text-primary text-sm uppercase tracking-wider">
                        {getRoundName(roundNum)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{roundMatches.length} partidos</span>
                  </button>

                  {/* Match Cards */}
                  {!isCollapsed && (
                    <div className="p-3 space-y-2">
                      {roundMatches.map(match => (
                        <div key={match.id} style={{ height: 52 }}>
                          <MatchCard match={match} onClick={setSelectedMatch} />
                        </div>
                      ))}
                      {roundMatches.length === 0 && (
                        <p className="text-center text-gray-500 text-xs py-4">Sin partidos en esta ronda</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
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