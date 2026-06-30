import React, { Fragment } from 'react'
import { User, ChevronDown, ChevronRight, Trophy } from 'lucide-react'
import { COUNTRIES } from '@/utils/countries'

// ── Bracket Layout Constants ──
const MATCH_H = 44   // match card fixed height (px)
const GAP = 26       // vertical gap between base slots (aumentado para mayor separación)
const SLOT_BASE = MATCH_H + GAP  // 70px per slot in the densest round
const HEADER_H = 28  // round header height
const CONN_W = 28    // connector column width
const COL_MIN_W = 180 // minimum column width

// ── Match Card (compact, fixed-height) ──
function MatchCard({ match, tournament, onClick, hoveredPlayerId, setHoveredPlayerId }) {
  const done = match.status === 'completed'
  const isP1Hovered = hoveredPlayerId && match.player1_id && match.player1_id === hoveredPlayerId
  const isP2Hovered = hoveredPlayerId && match.player2_id && match.player2_id === hoveredPlayerId
  const isMatchHovered = isP1Hovered || isP2Hovered
  const isDimmed = hoveredPlayerId && !isMatchHovered

  return (
    <div
      onClick={() => onClick && onClick(match)}
      className={`bg-gray-dark border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 h-full flex flex-col print:!border-none print:!bg-transparent print:!shadow-none ${
        isMatchHovered ? 'border-primary ring-2 ring-primary/50 z-10 relative scale-105' : 
        isDimmed ? 'border-primary/5 opacity-40 grayscale' : 'border-primary/10 hover:border-primary/50'
      }`}
    >
      {/* Player 1 */}
      <div 
        onMouseEnter={() => match.player1_id && setHoveredPlayerId(match.player1_id)}
        onMouseLeave={() => setHoveredPlayerId(null)}
        className={`flex-1 flex justify-between items-center px-2.5 border-b border-secondary/30 transition-colors print:!bg-transparent print:!text-black print:!border-transparent ${
          isP1Hovered ? 'bg-primary/20 text-white font-bold' :
          done && match.winner_id === match.player1_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {match.player1?.photo_url
            ? <img src={match.player1.photo_url} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
            : ['qualy', 'm15_singles', 'm15_doubles'].includes(tournament) && match.player1?.nationality
              ? <img src={`https://flagcdn.com/32x24/${match.player1.nationality.toLowerCase()}.png`} alt={match.player1.nationality} className="w-5 h-3.5 rounded-[2px] object-cover shrink-0 border border-gray-600" title={match.player1.nationality} />
              : <User className={`w-4 h-4 shrink-0 ${isP1Hovered ? 'text-white' : 'text-primary/40'}`} />
          }
          <div className="flex flex-col truncate">
            <span className="truncate text-[11px] leading-tight max-w-[105px]">
              {match.player1?.name || 'A confirmar'}
            </span>
            {['qualy', 'm15_singles', 'm15_doubles'].includes(tournament) ? (
              <span className="text-[9px] text-gray-400 print:!text-gray-600 leading-tight truncate max-w-[105px]">
                {COUNTRIES.find(c => c.code === match.player1?.nationality)?.name || match.player1?.nationality || ''} {match.player1?.atp_rank ? <span className="text-gray-500 print:!text-gray-600 font-medium ml-0.5">ATP:{match.player1.atp_rank}</span> : ''} {match.player1?.itf_rank ? <span className="text-gray-500 print:!text-gray-600 font-medium ml-0.5">ITF:{match.player1.itf_rank}</span> : ''}
              </span>
            ) : null}
          </div>
        </div>
        <span className="font-score text-[12px] tracking-wider font-bold ml-1 shrink-0">
          {done && match.score1 ? match.score1 : ''}
        </span>
      </div>
      {/* Player 2 */}
      <div 
        onMouseEnter={() => match.player2_id && setHoveredPlayerId(match.player2_id)}
        onMouseLeave={() => setHoveredPlayerId(null)}
        className={`flex-1 flex justify-between items-center px-2.5 transition-colors print:!bg-transparent print:!text-black ${
          isP2Hovered ? 'bg-primary/20 text-white font-bold' :
          done && match.winner_id === match.player2_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {match.player2?.photo_url
            ? <img src={match.player2.photo_url} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
            : ['qualy', 'm15_singles', 'm15_doubles'].includes(tournament) && match.player2?.nationality
              ? <img src={`https://flagcdn.com/32x24/${match.player2.nationality.toLowerCase()}.png`} alt={match.player2.nationality} className="w-5 h-3.5 rounded-[2px] object-cover shrink-0 border border-gray-600" title={match.player2.nationality} />
              : <User className={`w-4 h-4 shrink-0 ${isP2Hovered ? 'text-white' : 'text-primary/40'}`} />
          }
          <div className="flex flex-col truncate">
            <span className="truncate text-[11px] leading-tight max-w-[105px]">
              {match.player2?.name || 'A confirmar'}
            </span>
            {['qualy', 'm15_singles', 'm15_doubles'].includes(tournament) ? (
              <span className="text-[9px] text-gray-400 print:!text-gray-600 leading-tight truncate max-w-[105px]">
                {COUNTRIES.find(c => c.code === match.player2?.nationality)?.name || match.player2?.nationality || ''} {match.player2?.atp_rank ? <span className="text-gray-500 print:!text-gray-600 font-medium ml-0.5">ATP:{match.player2.atp_rank}</span> : ''} {match.player2?.itf_rank ? <span className="text-gray-500 print:!text-gray-600 font-medium ml-0.5">ITF:{match.player2.itf_rank}</span> : ''}
              </span>
            ) : null}
          </div>
        </div>
        <span className="font-score text-[12px] tracking-wider font-bold ml-1 shrink-0">
          {done && match.score2 ? match.score2 : ''}
        </span>
      </div>
    </div>
  )
}



export default function Bracket({ tournament, matches, onMatchClick }) {
  const [collapsedRounds, setCollapsedRounds] = React.useState({})
  const [hoveredPlayerId, setHoveredPlayerId] = React.useState(null)

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

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center max-w-xl mx-auto my-8">
        <Trophy className="w-16 h-16 text-primary/40 mx-auto mb-4" />
        <p className="text-xl text-gray-300 mb-2">Este cuadro aún no ha sido cargado por la organización.</p>
        <p className="text-gray-500 text-sm">Los cruces se verán reflejados tan pronto como se generen las llaves.</p>
      </div>
    )
  }

  const renderHeaders = () => (
    <div className="flex items-start mb-2" style={{ minWidth: rounds.length * COL_MIN_W + (rounds.length - 1) * CONN_W }}>
      {rounds.map((roundNum, roundIdx) => (
        <Fragment key={`h-${roundNum}`}>
          <div style={{ minWidth: COL_MIN_W, flex: '1 1 0' }}>
            <div
              className="text-center bg-gray-900 border border-primary/20 rounded-lg font-bold text-primary text-[11px] uppercase tracking-wider flex items-center justify-center select-none"
              style={{ height: HEADER_H }}
            >
              {getRoundName(roundNum)}
            </div>
          </div>
          {roundIdx !== rounds.length - 1 && <div style={{ width: CONN_W }} />}
        </Fragment>
      ))}
    </div>
  )

  const renderBody = () => (
    <div className="flex items-start" style={{ minWidth: rounds.length * COL_MIN_W + (rounds.length - 1) * CONN_W }}>
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
          <Fragment key={`b-${roundNum}`}>
            {/* ── Match Column ── */}
            <div style={{ minWidth: COL_MIN_W, flex: '1 1 0' }}>
              <div className="flex flex-col">
                {roundMatches.map(match => (
                  <div key={match.id} className="flex items-center" style={{ height: slotH }}>
                    {/* Left input stub */}
                    {!isFirst && (
                      <div
                        className="shrink-0 print:!border-black"
                        style={{ width: 8, height: 0, borderTop: '1.5px solid rgba(208,253,62,0.3)' }}
                      />
                    )}
                    {/* Match Card */}
                    <div className="flex-1 min-w-0" style={{ height: MATCH_H }}>
                      <MatchCard 
                        match={match} 
                        tournament={tournament}
                        onClick={onMatchClick} 
                        hoveredPlayerId={hoveredPlayerId}
                        setHoveredPlayerId={setHoveredPlayerId}
                      />
                    </div>
                    {/* Right output stub */}
                    {!isLast && (
                      <div
                        className="shrink-0 print:!border-black"
                        style={{ width: 8, height: 0, borderTop: '1.5px solid rgba(208,253,62,0.3)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── HTML Connector Lines ── */}
            {!isLast && (
              <div className="shrink-0 flex flex-col" style={{ width: CONN_W }}>
                <div className="flex flex-col w-full">
                  {(() => {
                    const prevCount = roundMatches.length
                    const nextCount = nextMatches.length
                    const prevSlotH = slotH
                    if (prevCount === 0 || nextCount === 0) return null

                    const strokeColor = 'rgba(208,253,62,0.3)'
                    const blocks = []

                    if (prevCount === nextCount * 2) {
                      const blockH = prevSlotH * 2
                      for (let j = 0; j < nextCount; j++) {
                        blocks.push(
                          <div key={`m-${j}`} style={{ height: blockH, position: 'relative', width: '100%' }}>
                            <div style={{ position: 'absolute', top: prevSlotH / 2, height: prevSlotH, left: 0, width: CONN_W / 2, borderTop: `1.5px solid ${strokeColor}`, borderBottom: `1.5px solid ${strokeColor}`, borderRight: `1.5px solid ${strokeColor}` }} className="print:!border-black" />
                            <div style={{ position: 'absolute', top: blockH / 2, left: CONN_W / 2, width: CONN_W / 2, borderTop: `1.5px solid ${strokeColor}` }} className="print:!border-black" />
                          </div>
                        )
                      }
                    } else if (prevCount === nextCount) {
                      for (let i = 0; i < prevCount; i++) {
                        const blockH = prevSlotH
                        blocks.push(
                          <div key={`p-${i}`} style={{ height: blockH, position: 'relative', width: '100%' }}>
                            <div style={{ position: 'absolute', top: blockH / 2, left: 0, width: CONN_W, borderTop: `1px dashed ${strokeColor}` }} className="print:!border-black" />
                          </div>
                        )
                      }
                    }
                    return blocks
                  })()}
                </div>
              </div>
            )}
          </Fragment>
        )
      })}
    </div>
  )

  // Calculate dynamic scale for print
  const bracketWidth = rounds.length * COL_MIN_W + (rounds.length - 1) * CONN_W
  const bracketHeight = firstRoundCount * SLOT_BASE + HEADER_H
  
  // A4 Portrait printable area (approximate pixels at 96dpi with 5mm margins)
  // We use conservative values to absolutely guarantee it fits on 1 page vertically
  const AVAILABLE_WIDTH = 730
  const AVAILABLE_HEIGHT = 1000 // Leave plenty of room for title and browser headers
  
  const scaleW = AVAILABLE_WIDTH / bracketWidth
  const scaleH = AVAILABLE_HEIGHT / bracketHeight
  const printScale = Math.min(scaleW, scaleH, 1.4) // Cap scale to prevent massive sizes

  return (
    <>
      {/* --- SCREEN VIEW (Full Bracket) --- */}
      <div className="hidden md:block print:hidden overflow-x-auto pb-8 -mx-4 px-4">
        {renderHeaders()}
        {renderBody()}
      </div>

      {/* --- PRINT VIEW --- */}
      <div className="hidden print:flex absolute left-0 top-0 bg-white z-[99999] w-full h-full flex-col items-center justify-center m-0 p-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        <style type="text/css" media="print">
          {`
            @page { size: portrait; margin: 5mm; }
            html, body { height: 100vh; overflow: hidden; margin: 0; padding: 0; background: white; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            
            /* Hide nextjs wrappers that might add height */
            #__next { height: 100vh; overflow: hidden; }
          `}
        </style>
        <div className="w-full flex flex-col items-center justify-center">
          <h3 className="text-black font-bold mb-4 text-center border-b border-black pb-2 uppercase tracking-widest text-2xl w-[90%]">
            {tournament.replace('_', ' ')} - CUADRO COMPLETO
          </h3>
          <div 
            className="flex justify-center" 
            style={{ 
              width: '100%', 
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div 
              style={{ 
                zoom: printScale,
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                transformOrigin: 'top center'
              }}
            >
              {renderHeaders()}
              {renderBody()}
            </div>
          </div>
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
                      <MatchCard 
                        match={match} 
                        tournament={tournament}
                        onClick={onMatchClick}
                        hoveredPlayerId={hoveredPlayerId}
                        setHoveredPlayerId={setHoveredPlayerId}
                      />
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
  )
}
