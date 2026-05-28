'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Trophy, Calendar, MapPin, Users, ArrowRight, Star, Megaphone, Clock, Sparkles } from 'lucide-react'

export default function Home() {
  const [sponsors, setSponsors] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
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
    const [spRes, nwRes, setRes] = await Promise.all([
      supabase.from('sponsors').select('*').order('priority', { ascending: true }),
      supabase.from('news').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('settings').select('*')
    ])

    if (!spRes.error) setSponsors(spRes.data || [])
    if (!nwRes.error) setNews(nwRes.data || [])
    
    if (setRes && !setRes.error && setRes.data) {
      const setMap = {}
      setRes.data.forEach(s => {
        setMap[s.key] = s.value
      })
      setSettings(prev => ({ ...prev, ...setMap }))
    }
    
    setLoading(false)
  }

  // Duplicate sponsors array to ensure a seamless infinite scroll loop
  const carouselSponsors = [...sponsors, ...sponsors, ...sponsors]

  return (
    <div className="min-h-screen bg-secondary">
      {/* 1. SPONSORS CAROUSEL (Calesita superior de patrocinadores) */}
      {sponsors.length > 0 && (
        <div className="bg-gray-dark border-b border-primary/20 overflow-hidden py-4 relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-secondary to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-secondary to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex animate-infinite-scroll items-center gap-12 whitespace-nowrap">
            {carouselSponsors.map((sponsor, idx) => (
              <a 
                key={`${sponsor.id}-${idx}`}
                href={sponsor.website || '#'} 
                target={sponsor.website ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-16 px-4 hover:scale-105 transition-transform duration-300"
                title={sponsor.name}
              >
                {sponsor.logo_url ? (
                  <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-12 w-auto object-contain" />
                ) : (
                  <span className="text-xs text-primary font-extrabold tracking-wider bg-secondary/80 border border-primary/25 rounded-lg px-4 py-2 uppercase shadow-inner">
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
        style={{ backgroundImage: 'linear-gradient(rgba(8, 20, 17, 0.82), rgba(8, 20, 17, 0.88)), url("/tennis_hero_bg.png")' }}
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(208,253,62,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(208,253,62,0.015)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative text-center max-w-5xl z-10">
          <span className="text-xs uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-full font-extrabold inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> ITF World Tennis Tour
          </span>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 leading-none">
            TORNEO M15 <span className="text-primary block md:inline">VILLA CONSTITUCIÓN</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-medium tracking-wide max-w-2xl mx-auto mb-10">
            El evento de tenis profesional más importante de la región.
          </p>

          {/* Quick Stats Grid */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm md:text-base text-gray-300 font-medium">
            <span className="flex items-center gap-2.5 bg-gray-dark px-5 py-3 rounded-xl border border-primary/15">
              <Calendar className="w-5 h-5 text-primary" /> Semana del 13 de Julio
            </span>
            <span className="flex items-center gap-2.5 bg-gray-dark px-5 py-3 rounded-xl border border-primary/15">
              <MapPin className="w-5 h-5 text-primary" /> Club Náutico Villa Constitución
            </span>
            <span className="flex items-center gap-2.5 bg-gray-dark px-5 py-3 rounded-xl border border-primary/15">
              <Trophy className="w-5 h-5 text-primary" /> Singles & Dobles
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

      {/* ROAD TO M15: PRE-TOURNAMENTS DIVISION */}
      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            EL CAMINO AL <span className="text-primary font-bold">M15</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2 max-w-xl mx-auto">
            Conoce las fases previas clasificatorias oficiales que se disputarán para obtener un lugar en el cuadro principal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* PREQUALY CARD */}
          <div className="court-card p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-white bg-clay px-3.5 py-1.5 rounded-full z-10">
                  Fase 1: PreQualy
                </span>
                <span className="text-xs text-gray-500 font-mono z-10">15 de Junio</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 z-10 relative">Pre-Clasificación Oficial</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 z-10 relative">
                Se jugará en las canchas de polvo de ladrillo del **Club Empalme Central**. Una oportunidad directa para los tenistas locales y regionales de medirse por el acceso al cuadro profesional.
              </p>
              
              <div className="space-y-3 mb-8 z-10 relative">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-clay" />
                  <span>Sede: **Club Empalme Central**</span>
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
                  Fase 2: Qualy
                </span>
                <span className="text-xs text-gray-500 font-mono z-10">12 y 13 de Julio</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 z-10 relative">Clasificación Principal</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 z-10 relative">
                La antesala del torneo principal se jugará en la sede central del torneo en polvo de ladrillo. Los ganadores de esta fase completarán el cuadro del M15.
              </p>
              
              <div className="space-y-3 mb-8 z-10 relative">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-clay" />
                  <span>Sede: **Club Náutico Villa Constitución**</span>
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
        </div>
      </div>

      {/* Información administrativa removida */}

      {/* BODY CONTENT (NEWS & SPONSORS GRID DETAILED) */}
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

        {/* DETAILED SPONSORS BLOCK AT THE BOTTOM */}
        {sponsors.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" /> Todos los Patrocinadores
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
    </div>
  )
}