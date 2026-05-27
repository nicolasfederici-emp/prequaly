'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Trophy, Calendar, MapPin, Users, Phone, ArrowRight, Star, Megaphone, Clock, X } from 'lucide-react'

export default function Home() {
  const [sponsors, setSponsors] = useState([])
  const [news, setNews] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [settings, setSettings] = useState({
    home_card1_title: 'Costo y Detalles',
    home_card1_desc: 'El valor de inscripción es de $60.000 ARS. Los 48 jugadores ya están confirmados para el cuadro principal.',
    home_card2_title: 'Wild Cards',
    home_card2_desc: 'El campeón obtendrá Wild Card para el cuadro principal del torneo internacional M15. El finalista jugará la Clasificación.',
    home_card3_title: 'Hospedaje Oficial',
    home_card3_desc: 'Se ofrece hospedaje oficial en el Club Náutico Villa Constitución a una tarifa promocional de $20.000 por día.',
  })

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    setLoading(true)
    const [spRes, nwRes, mtRes, setRes] = await Promise.all([
      supabase.from('sponsors').select('*').order('priority', { ascending: true }),
      supabase.from('news').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('matches')
        .select(`
          *,
          player1:player1_id (id, name, club, photo_url),
          player2:player2_id (id, name, club, photo_url)
        `)
        .order('match_number', { ascending: true }),
      supabase.from('settings').select('*')
    ])

    if (!spRes.error) setSponsors(spRes.data || [])
    if (!nwRes.error) setNews(nwRes.data || [])
    if (!mtRes.error) setMatches(mtRes.data || [])
    
    if (setRes && !setRes.error && setRes.data) {
      const setMap = {}
      setRes.data.forEach(s => {
        setMap[s.key] = s.value
      })
      setSettings(prev => ({ ...prev, ...setMap }))
    }
    
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

  return (
    <div className="min-h-screen bg-secondary">
      {/* HERO SECTION */}
      <div className="relative bg-black py-20 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFE50010_1px,transparent_1px),linear-gradient(to_bottom,#FFE50010_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="container mx-auto px-4 relative text-center max-w-4xl">
          <span className="text-xs uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full font-bold inline-block mb-4">
            Torneo Pre-Clasificatorio Oficial
          </span>
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight mb-4">
            PREQUALY <span className="text-primary">M15</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 font-bold uppercase tracking-wide mb-8">
            Villa Constitución
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm md:text-base text-gray-300 font-medium">
            <span className="flex items-center gap-2 bg-gray-dark px-4 py-2.5 rounded-xl border border-primary/15">
              <Calendar className="w-5 h-5 text-primary" /> Semana del 15 de Junio
            </span>
            <span className="flex items-center gap-2 bg-gray-dark px-4 py-2.5 rounded-xl border border-primary/15">
              <MapPin className="w-5 h-5 text-primary" /> Club Empalme Central
            </span>
            <span className="flex items-center gap-2 bg-gray-dark px-4 py-2.5 rounded-xl border border-primary/15">
              <Trophy className="w-5 h-5 text-primary" /> WC M15 Principal
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/cuadro" 
              className="bg-primary text-secondary font-black py-4 px-8 rounded-lg text-lg hover:bg-yellow-300 transition shadow-lg flex items-center justify-center gap-2"
            >
              VER CUADRO COMPLETO <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/jugadores" 
              className="bg-gray-dark text-white border border-primary/40 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              JUGADORES REGISTRADOS
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK INFO GRID (Border removed from hero, relative z-10 for perfect overlay) */}
      <div className="container mx-auto px-4 -mt-8 relative mb-16 max-w-5xl z-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-dark border border-primary/20 p-6 rounded-2xl shadow-xl">
            <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">Inscripciones</span>
            <h3 className="text-xl font-bold text-white mb-2">{settings.home_card1_title}</h3>
            <p className="text-gray-400 text-sm">{settings.home_card1_desc}</p>
          </div>
          <div className="bg-gray-dark border border-primary/20 p-6 rounded-2xl shadow-xl">
            <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">Premios</span>
            <h3 className="text-xl font-bold text-white mb-2">{settings.home_card2_title}</h3>
            <p className="text-gray-400 text-sm">{settings.home_card2_desc}</p>
          </div>
          <div className="bg-gray-dark border border-primary/20 p-6 rounded-2xl shadow-xl">
            <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">Hospedaje Oficial</span>
            <h3 className="text-xl font-bold text-white mb-2">{settings.home_card3_title}</h3>
            <p className="text-gray-400 text-sm">{settings.home_card3_desc}</p>
          </div>
        </div>
      </div>

      {/* CUADRO DEL TORNEO DIRECTAMENTE EN EL INICIO */}
      <div className="container mx-auto px-4 max-w-7xl mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-primary" /> CUADRO Y FIXTURE EN VIVO
          </h2>
          <p className="text-gray-400 text-sm mt-1">Haz clic en cualquier partido para ver detalles, horarios y clubes</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-primary flex items-center justify-center gap-2">
            <Clock className="w-6 h-6 animate-spin" /> Cargando fixture...
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-gray-dark border border-primary/20 rounded-xl p-12 text-center max-w-xl mx-auto">
            <Trophy className="w-16 h-16 text-primary/40 mx-auto mb-4" />
            <p className="text-xl text-gray-300 mb-2">El cuadro aún no ha sido generado.</p>
            <p className="text-gray-500 text-sm">Los partidos e información del sorteo se publicarán en breve.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-8 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-secondary">
            <div className="flex gap-8 min-w-[1500px] py-4">
              {[1, 2, 3, 4, 5, 6].map(roundNum => {
                const roundMatches = matchesByRound[roundNum] || []
                return (
                  <div key={roundNum} className="flex-1 flex flex-col justify-around min-w-[240px]">
                    <div className="text-center bg-gray-900 border border-primary/20 py-2 rounded-lg mb-6 font-bold text-primary text-xs uppercase tracking-wider">
                      {getRoundName(roundNum)}
                    </div>
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
                            {isLive && (
                              <div className="bg-yellow-400 text-black text-[9px] font-bold text-center py-0.5 tracking-widest uppercase">
                                En Vivo
                              </div>
                            )}

                            {/* Player 1 Row */}
                            <div className={`flex justify-between items-center px-3 py-2 border-b border-secondary/40 ${
                              isCompleted && match.winner_id === match.player1_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
                            }`}>
                              <span className="truncate text-xs max-w-[150px] group-hover:text-white transition">
                                {match.player1?.name || (roundNum === 1 ? 'BYE / Vacante' : 'A confirmar')}
                              </span>
                              <span className="font-mono text-xs font-bold ml-2">
                                {isCompleted && match.score1 ? match.score1 : isLive ? '🎾' : ''}
                              </span>
                            </div>

                            {/* Player 2 Row */}
                            <div className={`flex justify-between items-center px-3 py-2 ${
                              isCompleted && match.winner_id === match.player2_id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-300'
                            }`}>
                              <span className="truncate text-xs max-w-[150px] group-hover:text-white transition">
                                {match.player2?.name || (roundNum === 1 ? 'BYE / Vacante' : 'A confirmar')}
                              </span>
                              <span className="font-mono text-xs font-bold ml-2">
                                {isCompleted && match.score2 ? match.score2 : ''}
                              </span>
                            </div>

                            {/* Optional: schedule time shown directly inside the card */}
                            {match.scheduled_date && !isCompleted && !isLive && (
                              <div className="bg-secondary/40 text-[9px] text-gray-500 px-3 py-1 border-t border-secondary/20 flex justify-between">
                                <span>{new Date(match.scheduled_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
                                <span>{new Date(match.scheduled_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
                              </div>
                            )}
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
      </div>

      {/* BODY CONTENT (NEWS & SPONSORS) */}
      <div className="container mx-auto px-4 max-w-5xl space-y-16 pb-16">
        
        {/* LATEST NEWS */}
        {news.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-primary" /> Noticias Recientes
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {news.map(n => (
                <div key={n.id} className="bg-gray-dark border border-primary/15 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div>
                    {n.image && (
                      <div className="w-full h-40 overflow-hidden relative">
                        <img src={n.image} alt={n.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-[10px] text-primary font-bold block mb-1">{n.date}</span>
                      <h3 className="font-bold text-white text-base mb-2 line-clamp-2">{n.title}</h3>
                      <p className="text-gray-400 text-xs line-clamp-3">{n.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPONSORS BANNER (Render all sponsors in a clean grid directly) */}
        {sponsors.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" /> Patrocinadores Oficiales
              </h2>
              <Link href="/patrocinadores" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
                Ver detalles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-gray-dark border border-primary/10 rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center">
                {sponsors.map(sponsor => (
                  <a 
                    key={sponsor.id} 
                    href={sponsor.website || '#'} 
                    target={sponsor.website ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="w-full h-16 flex items-center justify-center p-2 bg-secondary rounded-lg border border-primary/5 hover:border-primary/30 hover:scale-105 transition-all overflow-hidden cursor-pointer"
                    title={sponsor.name}
                  >
                    {sponsor.logo_url ? (
                      <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-400 font-bold text-center">{sponsor.name}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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