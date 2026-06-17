'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Trophy, Calendar, MapPin, Users, ArrowRight, Star, Megaphone, Clock, Sparkles, X, Camera } from 'lucide-react'

export default function Home() {
  const [sponsors, setSponsors] = useState([])
  const [news, setNews] = useState([])
  const [gallery, setGallery] = useState([])
  const [settings, setSettings] = useState({})
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNews, setSelectedNews] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    setLoading(true)
    const [spRes, nwRes, stRes, glRes, mtRes] = await Promise.all([
      supabase.from('sponsors').select('*').order('priority', { ascending: true }),
      supabase.from('news').select('*').order('created_at', { ascending: false }).limit(2),
      supabase.from('settings').select('*'),
      supabase.from('gallery').select('*').order('created_at', { ascending: false }).limit(4),
      supabase.from('matches').select(`
        *,
        player1:player1_id (name, photo_url),
        player2:player2_id (name, photo_url)
      `).not('scheduled_date', 'is', null).order('scheduled_date', { ascending: true }).limit(30)
    ])

    if (!spRes.error) setSponsors(spRes.data || [])
    if (!nwRes.error) setNews(nwRes.data || [])
    if (!glRes.error) setGallery(glRes.data || [])
    if (!stRes.error && stRes.data) {
      const setMap = {}
      stRes.data.forEach(s => {
        setMap[s.key] = s.value
      })
      setSettings(setMap)
    }
    
    if (!mtRes.error && mtRes.data) {
      // Filter out completed matches and empty dates
      const validMatches = mtRes.data.filter(m => m.scheduled_date && m.scheduled_date.trim() !== '' && m.status !== 'completed')
      
      const todayDate = new Date()
      const todaysMatches = validMatches.filter(m => {
        const d = new Date(m.scheduled_date)
        return !isNaN(d) && d.getDate() === todayDate.getDate() && d.getMonth() === todayDate.getMonth() && d.getFullYear() === todayDate.getFullYear()
      })
      
      // If we have matches today, show them. Otherwise, show all upcoming valid matches
      setUpcomingMatches(todaysMatches.length > 0 ? todaysMatches : validMatches.slice(0, 10))
    }
    
    setLoading(false)
  }

  // Duplicate sponsors array to ensure a seamless infinite scroll loop
  const carouselSponsors = [...sponsors, ...sponsors, ...sponsors]
  
  // Duplicate matches enough times to always overflow the screen width for seamless animation
  const carouselMatches = [...upcomingMatches, ...upcomingMatches, ...upcomingMatches, ...upcomingMatches, ...upcomingMatches, ...upcomingMatches]

  return (
    <div className="min-h-screen bg-secondary">
      {/* 1. SPONSORS CAROUSEL (Calesita superior de patrocinadores) */}
      {sponsors.length > 0 && (
        <div className="bg-gray-dark border-b border-primary/20 overflow-hidden py-4 relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-secondary to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-secondary to-transparent z-10 pointer-events-none"></div>
          
          <div 
            className="flex animate-infinite-scroll items-center gap-12 whitespace-nowrap"
            style={{ animationDuration: `${settings.carousel_speed || 40}s` }}
          >
            {carouselSponsors.map((sponsor, idx) => (
              <a 
                key={`${sponsor.id}-${idx}`}
                href={sponsor.website ? (sponsor.website.startsWith('http') ? sponsor.website : `https://${sponsor.website}`) : '#'} 
                target={sponsor.website ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-32 px-4 hover:scale-105 transition-transform duration-300"
                title={sponsor.name}
              >
                {sponsor.logo_url ? (
                  <img src={sponsor.logo_url} alt={sponsor.name} className={`w-auto object-contain transition-all duration-300 ${
                    sponsor.category === 'principal' ? 'max-h-28 drop-shadow-[0_0_15px_rgba(208,253,62,0.4)] scale-110' :
                    sponsor.category === 'oficial' ? 'max-h-20 opacity-95' : 'max-h-14 opacity-70 grayscale hover:grayscale-0'
                  }`} />
                ) : (
                  <span className={`text-xs text-primary font-extrabold tracking-wider bg-secondary/80 border border-primary/25 rounded-lg px-4 py-2 uppercase shadow-inner ${
                    sponsor.category === 'principal' ? 'scale-110' :
                    sponsor.category === 'colaborador' ? 'scale-90 opacity-70' : ''
                  }`}>
                    {sponsor.name}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div 
        className="relative py-32 overflow-hidden border-b border-primary/10 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(8, 20, 17, 0.82), rgba(8, 20, 17, 0.88)), url("${settings.home_hero_bg_image || '/tennis_hero_bg.png'}")` }}
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(208,253,62,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(208,253,62,0.015)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative text-center max-w-5xl z-10">
          <span className="text-xs uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-full font-extrabold inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> {settings.home_badge_text || 'ITF World Tennis Tour'}
          </span>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 leading-none">
            {settings.home_hero_title || 'TORNEO M15'} <span className="text-primary block md:inline">{settings.home_hero_subtitle || 'VILLA CONSTITUCIÓN'}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-medium tracking-wide max-w-2xl mx-auto mb-10">
            {settings.home_hero_desc || 'El evento de tenis profesional más importante de la región.'}
          </p>

          {/* Quick Stats Grid */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm md:text-base text-gray-300 font-medium">
            <span className="flex items-center gap-2.5 bg-gray-dark px-5 py-3 rounded-xl border border-primary/15">
              <Calendar className="w-5 h-5 text-primary" /> {settings.home_stats_1 || 'Semana del 13 de Julio'}
            </span>
            <span className="flex items-center gap-2.5 bg-gray-dark px-5 py-3 rounded-xl border border-primary/15">
              <MapPin className="w-5 h-5 text-primary" /> {settings.home_stats_2 || 'Club Náutico Villa Constitución'}
            </span>
            <span className="flex items-center gap-2.5 bg-gray-dark px-5 py-3 rounded-xl border border-primary/15">
              <Trophy className="w-5 h-5 text-primary" /> {settings.home_stats_3 || 'Singles & Dobles'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/cuadro" 
              className="bg-primary text-secondary font-black py-4 px-8 rounded-lg text-lg hover:bg-white hover:text-secondary transition shadow-lg flex items-center justify-center gap-2"
            >
              VER CUADROS DEL TORNEO <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/jugadores" 
              className="bg-gray-dark text-white border border-primary/30 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              VER JUGADORES
            </Link>
          </div>
        </div>
      </div>

      {/* MATCHES CAROUSEL */}
      {upcomingMatches.length > 0 && (
        <div className="bg-gray-900 border-b border-primary/10 py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                PROGRAMACIÓN
              </h2>
              <Link href="/resultados" className="text-primary hover:text-white text-sm font-bold flex items-center gap-1 transition">
                Ver todo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative overflow-hidden w-full">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"></div>
              
              <div 
                className="flex animate-infinite-scroll gap-4 pb-4 items-center"
                style={{ animationDuration: `${settings.matches_carousel_speed || 30}s` }}
              >
                {carouselMatches.map((match, idx) => {
                  const dateObj = new Date(match.scheduled_date)
                  const timeStr = isNaN(dateObj) ? '-' : dateObj.toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false }) + ' hs'
                  
                  let dateStr = 'A confirmar'
                  if (!isNaN(dateObj)) {
                    let dStr = dateObj.toLocaleDateString('es-AR', {
                      timeZone: 'America/Argentina/Buenos_Aires',
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short'
                    })
                    dateStr = dStr.charAt(0).toUpperCase() + dStr.slice(1)
                  }

                  return (
                    <div key={`${match.id}-${idx}`} className="min-w-[280px] md:min-w-[320px] bg-gray-dark border border-primary/20 rounded-xl p-4 shrink-0 hover:border-primary/50 transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                          {match.court || 'Cancha a def.'}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {match.player1?.photo_url ? (
                              <img src={match.player1.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                <span className="text-[10px] text-gray-400">P1</span>
                              </div>
                            )}
                            <span className="font-bold text-sm text-gray-200 truncate max-w-[140px]">{match.player1?.name || 'A confirmar'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {match.player2?.photo_url ? (
                              <img src={match.player2.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                <span className="text-[10px] text-gray-400">P2</span>
                              </div>
                            )}
                            <span className="font-bold text-sm text-gray-200 truncate max-w-[140px]">{match.player2?.name || 'A confirmar'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-primary/10 pt-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-primary">
                          <Clock className="w-5 h-5" />
                          <span className="text-lg font-bold">{timeStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROAD TO M15: PRE-TOURNAMENTS DIVISION */}
      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            {settings.home_fases_title || 'EL CAMINO AL M15'}
          </h2>
          <p className="text-gray-400 text-sm mt-2 max-w-xl mx-auto">
            {settings.home_fases_desc || 'Conoce las fases previas clasificatorias oficiales que se disputarán para obtener un lugar en el cuadro principal.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {/* PREQUALY CARD */}
          <div className="court-card p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-white bg-clay px-3.5 py-1.5 rounded-full z-10">
                  {settings.fase1_name || 'Fase 1: PreQualy'}
                </span>
                <span className="text-xs text-gray-500 font-mono z-10">{settings.fase1_date || '15 de Junio'}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 z-10 relative">{settings.fase1_title || 'Pre-Clasificación Oficial'}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 z-10 relative">
                {settings.fase1_desc || 'Se jugará en las canchas de polvo de ladrillo del **Club Empalme Central**. Una oportunidad directa para los tenistas locales y regionales de medirse por el acceso al cuadro profesional.'}
              </p>
              
              <div className="space-y-3 mb-8 z-10 relative">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-clay" />
                  <span>{settings.fase1_venue || 'Sede: **Club Empalme Central**'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span>**Campeón:** Clasifica al Cuadro Principal M15</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>**Finalista:** Clasifica a la Qualy</span>
                </div>
              </div>
            </div>
            
            <Link 
              href="/cuadro?torneo=prequaly" 
              className="bg-secondary text-primary border border-primary/30 py-3 px-4 rounded-xl font-bold text-center hover:bg-primary hover:text-secondary transition flex items-center justify-center gap-2 z-10"
            >
              Cuadro PreQualy <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* QUALY CARD */}
          <div className="court-card p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-white bg-clay px-3.5 py-1.5 rounded-full z-10">
                  {settings.fase2_name || 'Fase 2: Qualy'}
                </span>
                <span className="text-xs text-gray-500 font-mono z-10">{settings.fase2_date || '12 y 13 de Julio'}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 z-10 relative">{settings.fase2_title || 'Clasificación Principal'}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 z-10 relative">
                {settings.fase2_desc || 'La antesala del torneo principal se jugará en la sede central del torneo en polvo de ladrillo. Los ganadores de esta fase completarán el cuadro del M15.'}
              </p>
              
              <div className="space-y-3 mb-8 z-10 relative">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-clay" />
                  <span>{settings.fase2_venue || 'Sede: **Club Náutico Villa Constitución**'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span>Cuadro oficial de **32 jugadores**</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Otorga las plazas definitivas al cuadro M15</span>
                </div>
              </div>
            </div>
            
            <Link 
              href="/cuadro?torneo=qualy" 
              className="bg-secondary text-primary border border-primary/30 py-3 px-4 rounded-xl font-bold text-center hover:bg-primary hover:text-secondary transition flex items-center justify-center gap-2 z-10"
            >
              Cuadro Qualy <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* MAIN DRAW CARD */}
          <div className="court-card p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-secondary bg-primary px-3.5 py-1.5 rounded-full z-10">
                  {settings.fase3_name || 'Fase 3: Torneo Principal'}
                </span>
                <span className="text-xs text-gray-500 font-mono z-10">{settings.fase3_date || '15 al 21 de Julio'}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 z-10 relative">{settings.fase3_title || 'Main Draw M15'}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 z-10 relative">
                {settings.fase3_desc || 'El evento internacional más importante de la región. Profesionales de todo el mundo compiten por puntos para el ranking ATP mundial.'}
              </p>
              
              <div className="space-y-3 mb-8 z-10 relative">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-clay" />
                  <span>{settings.fase3_venue || 'Sede: **Club Náutico Villa Constitución**'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span>Cuadro principal de **32 jugadores**</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Star className="w-4 h-4 text-primary" />
                  <span>Puntos para el ranking **ATP Mundial**</span>
                </div>
              </div>
            </div>
            
            <Link 
              href="/cuadro?torneo=main" 
              className="bg-primary text-secondary border border-primary py-3 px-4 rounded-xl font-bold text-center hover:bg-white hover:text-secondary transition flex items-center justify-center gap-2 z-10"
            >
              Cuadro Principal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Información administrativa removida */}

      {/* BODY CONTENT (NEWS & SPONSORS GRID DETAILED) */}
      <div className="container mx-auto px-4 max-w-5xl space-y-16 pb-16">
        
        {/* NEWS & GALLERY SPLIT SECTION */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LATEST NEWS (Left Column) */}
          {news.length > 0 && (
            <div className="lg:col-span-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-primary" /> {settings.home_news_title || 'Noticias Recientes'}
                </h2>
              </div>
              
              <div className="space-y-6">
                {news.map(n => (
                  <div 
                    key={n.id} 
                    className="bg-gray-dark border border-primary/15 hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer"
                    onClick={() => setSelectedNews(n)}
                  >
                    <div>
                      {n.image && (
                        <div className="w-full h-40 overflow-hidden relative">
                          <img src={n.image} alt={n.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-5">
                        <span className="text-[10px] text-primary font-bold block mb-1">{n.date ? n.date.slice(0, 10) : ''}</span>
                        <h3 className="font-bold text-white text-base mb-2 line-clamp-2">{n.title}</h3>
                        <p className="text-gray-400 text-xs line-clamp-3">{n.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY PREVIEW (Right Columns) */}
          {gallery.length > 0 && (
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Camera className="w-6 h-6 text-primary" /> Galería Destacada
                </h2>
                <Link href="/galeria" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
                  Ver galería <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {gallery.map(img => (
                  <div 
                    key={img.id} 
                    className="bg-gray-dark border border-primary/15 rounded-xl overflow-hidden h-40 md:h-[18.5rem] hover:border-primary/50 transition cursor-pointer group relative"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img.image_url} alt={img.caption || 'Galería'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
              {gallery.length === 0 && (
                <div className="h-full min-h-[300px] border border-dashed border-primary/20 rounded-xl flex items-center justify-center text-gray-500">
                  Aún no hay fotos en la galería
                </div>
              )}
            </div>
          )}
        </div>

        {/* DETAILED SPONSORS BLOCK AT THE BOTTOM */}
        {sponsors.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" /> {settings.home_sponsors_title || 'Todos los Patrocinadores'}
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
                    href={sponsor.website ? (sponsor.website.startsWith('http') ? sponsor.website : `https://${sponsor.website}`) : '#'} 
                    target={sponsor.website ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="w-full h-32 flex items-center justify-center p-2 bg-secondary rounded-lg border border-primary/5 hover:border-primary/30 hover:scale-105 transition-all overflow-hidden cursor-pointer"
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

      {/* NEWS MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedNews(null)}>
          <div 
            className="bg-gray-dark border border-primary/50 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-primary hover:text-secondary transition z-10"
              onClick={() => setSelectedNews(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            {selectedNews.image && (
              <div className="w-full max-h-[50vh] overflow-hidden bg-black flex items-center justify-center">
                <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-auto max-h-[50vh] object-contain" />
              </div>
            )}
            
            <div className="p-8">
              <span className="text-sm text-primary font-bold block mb-2">{selectedNews.date ? selectedNews.date.slice(0, 10) : ''}</span>
              <h2 className="text-3xl font-extrabold text-white mb-6 leading-tight">{selectedNews.title}</h2>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                {selectedNews.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY IMAGE MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div 
            className="w-full max-w-5xl max-h-[90vh] flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute -top-12 right-0 md:-right-12 md:top-0 bg-primary text-secondary p-2 rounded-full hover:bg-white transition z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="w-full flex-1 overflow-hidden flex items-center justify-center">
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.caption || 'Foto de galería'} 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              />
            </div>
            
            {selectedImage.caption && (
              <div className="text-center mt-4">
                <p className="text-white text-lg font-medium">{selectedImage.caption}</p>
                <span className="text-primary text-sm font-bold uppercase tracking-wider">{selectedImage.tournament.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}