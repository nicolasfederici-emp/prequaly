import React, { Fragment } from 'react'
import { User, ChevronDown, ChevronRight, Trophy } from 'lucide-react'

// ── Bracket Layout Constants ──
const MATCH_H = 44   // match card fixed height (px)
const GAP = 6        // vertical gap between base slots
const SLOT_BASE = MATCH_H + GAP  // 50px per slot in the densest round
const HEADER_H = 28  // round header height
const CONN_W = 28    // connector column width
const COL_MIN_W = 180 // minimum column width

// ── Match Card (compact, fixed-height) ──
function MatchCard({ match, onClick, hoveredPlayerId, setHoveredPlayerId }) {
  const done = match.status === 'completed'
  const isP1Hovered = hoveredPlayerId && match.player1_id && match.player1_id === hoveredPlayerId
  const isP2Hovered = hoveredPlayerId && match.player2_id && match.player2_id === hoveredPlayerId
  const isMatchHovered = isP1Hovered || isP2Hovered
  const isDimmed = hoveredPlayerId && !isMatchHovered

  return (
    <div
      onClick={() => onClick && onClick(match)}
      className={`bg-gray-dark border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 h-full flex flex-col ${
        isMatchHovered ? 'border-primary ring-2 ring-primary/50 z-10 relative scale-105' : 
        isDimmed ? 'border-primary/5 opacity-40 grayscale' : 'border-primary/10 hover:border-primary/50'
      }`}
    >
      {/* Player 1 */}
      <div 
        onMouseEnter={() => match.player1_id && setHoveredPlayerId(match.player1_id)}
        onMouseLeave={() => setHoveredPlayerId(null)}
        className={`flex-1 flex justify-between items-center px-2.5 border-b border-secondary/30 transition-colors ${
          isP1Hovered ? 'bg-primary/20 text-white font-bold' :
          done && match.winner_id === match.player1_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {match.player1?.photo_url
            ? <img src={match.player1.photo_url} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
            : <User className={`w-3.5 h-3.5 shrink-0 ${isP1Hovered ? 'text-white' : 'text-primary/40'}`} />
          }
          <span className="truncate text-[11px] max-w-[105px]">
            {match.player1?.name || 'A confirmar'}
          </span>
        </div>
        <span className="font-score text-[12px] tracking-wider font-bold ml-1 shrink-0">
          {done && match.score1 ? match.score1 : ''}
        </span>
      </div>
      {/* Player 2 */}
      <div 
        onMouseEnter={() => match.player2_id && setHoveredPlayerId(match.player2_id)}
        onMouseLeave={() => setHoveredPlayerId(null)}
        className={`flex-1 flex justify-between items-center px-2.5 transition-colors ${
          isP2Hovered ? 'bg-primary/20 text-white font-bold' :
          done && match.winner_id === match.player2_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {match.player2?.photo_url
            ? <img src={match.player2.photo_url} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
            : <User className={`w-3.5 h-3.5 shrink-0 ${isP2Hovered ? 'text-white' : 'text-primary/40'}`} />
          }
          <span className="truncate text-[11px] max-w-[105px]">
            {match.player2?.name || 'A confirmar'}
          </span>
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

  return (
    <>
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

  const SPLIT_H = (firstRoundCount / 2) * SLOT_BASE
  // Offset to ensure the Final match (which is centered exactly at SPLIT_H) falls completely on Page 1
  const PRINT_OFFSET = 30

      {/* --- SCREEN VIEW (Full Bracket) --- */}
      <div className="hidden md:block print:hidden overflow-x-auto pb-8 -mx-4 px-4">
        {renderHeaders()}
        {renderBody()}
      </div>

      {/* --- PRINT VIEW (Split across 2 pages) --- */}
      <div className="hidden print:block w-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        {/* Page 1: Top Half */}
        <div style={{ pageBreakAfter: 'always', paddingBottom: '20px' }}>
          <h3 className="text-black font-bold mb-4 text-center border-b pb-2 uppercase tracking-widest">
            {tournament.replace('_', ' ')} - Mitad Superior
          </h3>
          <div className="scale-[0.95] origin-top-left">
            {renderHeaders()}
            <div style={{ height: SPLIT_H + PRINT_OFFSET, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
                {renderBody()}
              </div>
            </div>
          </div>
        </div>

        {/* Page 2: Bottom Half */}
        <div style={{ paddingTop: '20px' }}>
          <h3 className="text-black font-bold mb-4 text-center border-b pb-2 uppercase tracking-widest mt-4">
            {tournament.replace('_', ' ')} - Mitad Inferior
          </h3>
          <div className="scale-[0.95] origin-top-left">
            {renderHeaders()}
            <div style={{ height: SPLIT_H - PRINT_OFFSET, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -(SPLIT_H + PRINT_OFFSET), left: 0, width: '100%' }}>
                {renderBody()}
              </div>
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
