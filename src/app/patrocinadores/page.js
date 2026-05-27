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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {sponsors.map(sponsor => (
            <div key={sponsor.id} className="bg-gray-dark rounded-2xl border border-primary/20 hover:border-primary transition p-6 flex flex-col justify-between">
              <div>
                <div className="w-full h-32 bg-secondary rounded-xl mb-6 flex items-center justify-center p-3 border border-primary/10 overflow-hidden">
                  {sponsor.logo_url ? (
                    <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Star className="w-10 h-10 text-primary" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2 text-center">{sponsor.name}</h3>
                {sponsor.description && (
                  <p className="text-gray-300 text-sm text-center mb-6">{sponsor.description}</p>
                )}
              </div>
              
              {sponsor.website && (
                <div className="text-center pt-2">
                  <a 
                    href={sponsor.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-secondary text-primary border border-primary/40 hover:bg-primary hover:text-secondary px-4 py-2 rounded-lg font-bold text-sm transition inline-block w-full"
                  >
                    Visitar Sitio Web
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 border-2 border-primary text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">¿Querés ser parte del torneo?</h2>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          Sumate como patrocinador oficial y poné tu marca ante miles de aficionados y deportistas de la región.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a 
            href="https://wa.me/5493400517063?text=Hola%20Esteban,%20me%20interesa%20patrocinar%20el%20torneo%20PreQualy%20M15"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary text-secondary px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition"
          >
            <Phone className="w-5 h-5" />
            WhatsApp Esteban (3400 517063)
          </a>
          <a 
            href="mailto:estebanspinetta@gmail.com?subject=Patrocinio%20PreQualy%20M15"
            className="flex items-center gap-2 bg-gray-dark border border-primary/40 text-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition"
          >
            <Mail className="w-5 h-5" />
            Enviar Correo
          </a>
        </div>
      </div>
    </div>
  )
}