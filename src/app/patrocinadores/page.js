'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Star, RefreshCw, Mail, Phone } from 'lucide-react'

export default function PatrocinadoresPage() {
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('priority', { ascending: true })

    if (error) console.error('Error fetching sponsors:', error)
    else setSponsors(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-primary flex items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span>Cargando patrocinadores...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">NUESTROS PATROCINADORES</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Gracias al apoyo de estas empresas y comercios que hacen posible la realización del PreQualy Oficial M15 Villa Constitución.
        </p>
      </div>

      {sponsors.length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-2xl p-12 text-center max-w-md mx-auto mb-16">
          <Star className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <p className="text-xl text-gray-300 mb-2">Próximamente patrocinadores</p>
          <p className="text-gray-500 text-sm">Los auspiciantes oficiales del torneo se publicarán a la brevedad.</p>
        </div>
      ) : (
        <div className="space-y-16 mb-16">
          
          {/* TITLE SPONSORS (Principal) */}
          {sponsors.filter(s => s.category === 'principal').length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-white text-center mb-8 border-b border-primary/20 pb-4">Title Sponsors</h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {sponsors.filter(s => s.category === 'principal').map(sponsor => (
                  <div key={sponsor.id} className="bg-gradient-to-br from-gray-dark to-secondary rounded-2xl border-2 border-primary hover:scale-105 transition-transform duration-300 p-8 flex flex-col justify-between shadow-2xl shadow-primary/10">
                    <div>
                      <div className="w-full h-48 bg-white/5 rounded-xl mb-6 flex items-center justify-center p-4 border border-primary/20 overflow-hidden">
                        {sponsor.logo_url ? (
                          <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Star className="w-16 h-16 text-primary" />
                        )}
                      </div>
                      <h3 className="text-3xl font-bold text-primary mb-3 text-center">{sponsor.name}</h3>
                      {sponsor.description && (
                        <p className="text-gray-300 text-center mb-6">{sponsor.description}</p>
                      )}
                    </div>
                    {sponsor.website && (
                      <div className="text-center pt-4">
                        <a href={sponsor.website.startsWith('http') ? sponsor.website : `https://${sponsor.website}`} target="_blank" rel="noopener noreferrer" className="bg-primary text-secondary hover:bg-white hover:text-secondary px-6 py-3 rounded-xl font-bold transition inline-block w-full">
                          Sitio Web
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPONSORS OFICIALES */}
          {sponsors.filter(s => s.category === 'oficial').length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white text-center mb-8 border-b border-gray-700 pb-4">Sponsors Oficiales</h2>
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {sponsors.filter(s => s.category === 'oficial').map(sponsor => (
                  <div key={sponsor.id} className="bg-gray-dark rounded-xl border border-primary/30 hover:border-primary transition p-6 flex flex-col justify-between">
                    <div>
                      <div className="w-full h-32 bg-secondary rounded-lg mb-4 flex items-center justify-center p-3 overflow-hidden">
                        {sponsor.logo_url ? <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain" /> : <Star className="w-10 h-10 text-primary" />}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 text-center">{sponsor.name}</h3>
                      {sponsor.description && <p className="text-gray-400 text-sm text-center mb-4 line-clamp-3">{sponsor.description}</p>}
                    </div>
                    {sponsor.website && (
                      <div className="text-center pt-2">
                        <a href={sponsor.website.startsWith('http') ? sponsor.website : `https://${sponsor.website}`} target="_blank" rel="noopener noreferrer" className="text-primary border border-primary/40 hover:bg-primary hover:text-secondary px-4 py-2 rounded-lg font-bold text-sm transition inline-block w-full">Visitar Sitio</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COLABORADORES */}
          {sponsors.filter(s => s.category === 'colaborador' || !s.category).length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-400 text-center mb-8 border-b border-gray-800 pb-4">Colaboradores</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
                {sponsors.filter(s => s.category === 'colaborador' || !s.category).map(sponsor => (
                  <a key={sponsor.id} href={sponsor.website ? (sponsor.website.startsWith('http') ? sponsor.website : `https://${sponsor.website}`) : '#'} target={sponsor.website ? '_blank' : '_self'} rel="noopener noreferrer" className="bg-secondary/50 rounded-lg border border-gray-800 hover:border-primary/50 transition p-4 flex flex-col items-center justify-center text-center cursor-pointer group h-32">
                    {sponsor.logo_url ? (
                      <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-16 max-w-full object-contain mb-2 group-hover:scale-110 transition-transform" />
                    ) : (
                      <span className="text-sm font-bold text-gray-300 group-hover:text-primary transition-colors">{sponsor.name}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}