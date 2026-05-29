'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Info, MapPin, Phone, HelpCircle } from 'lucide-react'

export default function ReglamentoPage() {
  const [settings, setSettings] = useState({
    informacion_torneo: '',
    logistica_sede: '',
    contacto_esteban: '',
    contacto_lucas: '',
    contacto_omar: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase.from('settings').select('*')
        if (!error && data) {
          const setMap = {}
          data.forEach(s => {
            setMap[s.key] = s.value
          })
          setSettings(prev => ({ ...prev, ...setMap }))
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const cleanPhone = (phone) => {
    return phone ? phone.replace(/\D/g, '') : ''
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-12">
      
      {/* Page Header */}
      <div className="text-center mb-8 border-b border-primary/10 pb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">INFORMACIÓN DEL TORNEO</h1>
        <p className="text-gray-400">Detalles esenciales y logística para jugadores y acompañantes</p>
      </div>

      {/* Information Section */}
      <section className="bg-gray-dark border border-primary/20 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-primary/10 pb-3">
          <Info className="w-6 h-6" /> 1. Información General
        </h2>
        
        <div className="text-gray-300">
          {settings.informacion_torneo ? (
            <p className="whitespace-pre-line text-sm leading-relaxed">{settings.informacion_torneo}</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">
                Bienvenidos a la página de información del Torneo M15 Villa Constitución. Aquí encontrarás todos los detalles relacionados con inscripciones, premios, sistema de juego y pautas generales del torneo.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
                <li>Cupo máximo: 48 jugadores (cuadro cerrado).</li>
                <li>Costo de inscripción: <strong className="text-primary">$60.000 ARS</strong>.</li>
                <li>Premio Campeón: Wild Card directo al Cuadro Principal del Torneo Internacional M15.</li>
                <li>Premio Finalista: Wild Card a la Fase de Clasificación (Qualy) del M15.</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Sede Venue Section */}
      <section className="bg-gray-dark border border-primary/20 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-primary/10 pb-3">
          <MapPin className="w-6 h-6" /> 2. Sede del Torneo
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-gray-300">
            <h3 className="font-bold text-white text-lg">Club Empalme Central</h3>
            {settings.logistica_sede ? (
              <p className="whitespace-pre-line text-sm leading-relaxed">{settings.logistica_sede}</p>
            ) : (
              <>
                <p className="text-sm">
                  Las canchas del torneo son de polvo de ladrillo en excelentes condiciones profesionales, con iluminación de última generación.
                </p>
                <div className="text-sm space-y-2">
                  <p>📍 <strong>Dirección:</strong> Juan José Paso 49, Empalme Villa Constitución, Santa Fe, Argentina.</p>
                  <p>📍 <strong>Coordenadas:</strong> Cerca del acceso principal de la autopista Buenos Aires - Rosario, facilitando la llegada de jugadores de todo el país.</p>
                </div>
              </>
            )}
            
            <a 
              href="https://maps.google.com/?q=Club+Empalme+Central+Juan+Jose+Paso+49+Empalme+Villa+Constitucion" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-secondary text-primary border border-primary/30 hover:bg-primary hover:text-secondary px-5 py-2.5 rounded-lg font-bold text-sm transition inline-block text-center w-full sm:w-auto"
            >
              Cómo llegar en Google Maps
            </a>
          </div>
          
          <div className="bg-secondary rounded-xl h-48 border border-primary/10 flex items-center justify-center text-gray-500 text-center p-4">
            <div className="space-y-2">
              <MapPin className="w-8 h-8 text-primary mx-auto" />
              <span className="text-xs block text-gray-400">Club Empalme Central</span>
              <span className="text-[10px] text-gray-600 block">Juan José Paso 49, Empalme Villa Constitución</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-dark border border-primary/20 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2 border-b border-primary/10 pb-3">
          <Phone className="w-6 h-6" /> 3. Contactos y Organización
        </h2>
        
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-secondary p-5 rounded-xl border border-primary/10 text-center">
            <span className="text-xs text-primary font-bold block mb-1">Director de Torneo</span>
            <h4 className="font-bold text-white text-base mb-2">Esteban Spinetta</h4>
            <a href={`tel:${cleanPhone(settings.contacto_esteban || '3400517063')}`} className="text-sm text-gray-300 hover:text-primary transition block mb-1">
              📞 {settings.contacto_esteban || '3400 517063'}
            </a>
            <a 
              href={`https://wa.me/549${cleanPhone(settings.contacto_esteban || '3400517063')}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline"
            >
              WhatsApp
            </a>
          </div>

          <div className="bg-secondary p-5 rounded-xl border border-primary/10 text-center">
            <span className="text-xs text-primary font-bold block mb-1">Director de Torneo</span>
            <h4 className="font-bold text-white text-base mb-2">Lucas Mazzei</h4>
            <a href={`tel:${cleanPhone(settings.contacto_lucas || '3402496892')}`} className="text-sm text-gray-300 hover:text-primary transition block mb-1">
              📞 {settings.contacto_lucas || '3402 496892'}
            </a>
            <a 
              href={`https://wa.me/549${cleanPhone(settings.contacto_lucas || '3402496892')}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline"
            >
              WhatsApp
            </a>
          </div>

          <div className="bg-secondary p-5 rounded-xl border border-primary/10 text-center">
            <span className="text-xs text-primary font-bold block mb-1">Árbitro General (Referee)</span>
            <h4 className="font-bold text-white text-base mb-2">Omar Descarrega</h4>
            {settings.contacto_omar ? (
              <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">{settings.contacto_omar}</p>
            ) : (
              <p className="text-xs text-gray-400">Coordinación de firmas, sorteos de llaves y horarios oficiales de partidos.</p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 p-6 rounded-2xl flex items-start gap-4">
        <HelpCircle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-white text-lg mb-1">¿Tenés dudas adicionales?</h4>
          <p className="text-sm text-gray-300">
            Comunicate directamente con la dirección del torneo para consultar sobre acreditación de prensa, accesos para el público general o reprogramaciones por mal clima.
          </p>
        </div>
      </div>
      
    </div>
  )
}