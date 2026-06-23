'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RefreshCw, Camera, X, Calendar, Download } from 'lucide-react'

export default function GaleriaPage() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'prequaly', 'qualy', 'm15', 'general'
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [instagramWidget, setInstagramWidget] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch settings first
    const { data: settingsData } = await supabase.from('settings').select('*').eq('key', 'instagram_widget_code')
    if (settingsData && settingsData.length > 0 && settingsData[0].value) {
      setInstagramWidget(settingsData[0].value)
    }

    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching gallery:', error)
    } else {
      setPhotos(data || [])
    }
    setLoading(false)
  }



  const getTournamentLabel = (tourn) => {
    switch (tourn) {
      case 'prequaly': return 'PreQualy'
      case 'qualy': return 'Qualy'
      case 'm15': return 'M15 Villa Constitución'
      case 'general': return 'General'
      default: return 'Torneo'
    }
  }

  const getTournamentColorClass = (tourn) => {
    switch (tourn) {
      case 'prequaly': return 'bg-yellow-950/60 text-yellow-400 border-yellow-700/30'
      case 'qualy': return 'bg-orange-950/60 text-orange-400 border-orange-700/30'
      case 'm15': return 'bg-blue-950/60 text-blue-400 border-blue-700/30'
      case 'general': return 'bg-gray-800 text-gray-400 border-gray-700'
      default: return 'bg-gray-800 text-gray-400 border-gray-700'
    }
  }

  const filteredPhotos = photos.filter(p => {
    if (filter === 'all') return true
    return p.tournament === filter
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl min-h-[70vh]">
      {/* Title */}
      <div className="border-b border-primary/10 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
          <Camera className="w-10 h-10 text-primary" /> GALERÍA DE FOTOS
        </h1>
        <p className="text-gray-400 mt-1">Imágenes oficiales y momentos destacados de los torneos en tiempo real</p>
      </div>

      {instagramWidget && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4">Últimas Novedades en Instagram</h2>
          <div className="bg-gray-dark border border-primary/20 rounded-2xl p-4 sm:p-8 shadow-xl min-h-[300px] flex items-center justify-center">
            <div dangerouslySetInnerHTML={{ __html: instagramWidget }} className="w-full max-w-4xl mx-auto overflow-hidden" />
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4">Galería Oficial del Torneo</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-dark p-1.5 rounded-xl border border-primary/20">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 min-w-[90px] text-center py-2.5 px-3 rounded-lg font-black transition text-xs ${filter === 'all' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          TODAS
        </button>
        <button
          onClick={() => setFilter('prequaly')}
          className={`flex-1 min-w-[95px] text-center py-2.5 px-3 rounded-lg font-black transition text-xs ${filter === 'prequaly' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          PREQUALY
        </button>
        <button
          onClick={() => setFilter('qualy')}
          className={`flex-1 min-w-[95px] text-center py-2.5 px-3 rounded-lg font-black transition text-xs ${filter === 'qualy' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          QUALY
        </button>
        <button
          onClick={() => setFilter('m15')}
          className={`flex-1 min-w-[100px] text-center py-2.5 px-3 rounded-lg font-black transition text-xs ${filter === 'm15' ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
        >
          M15 VILLA C.
        </button>

      </div>

      {loading ? (
        <div className="text-center py-16 text-primary flex items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" /> Cargando galería...
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="bg-gray-dark border border-primary/20 rounded-xl p-16 text-center max-w-xl mx-auto my-8">
          <Camera className="w-16 h-16 text-primary/30 mx-auto mb-4" />
          <p className="text-xl text-gray-300 mb-2">Aún no hay fotos subidas en esta categoría.</p>
          <p className="text-gray-500 text-sm">El fotógrafo oficial cargará las capturas del torneo próximamente.</p>
        </div>
      ) : (
        /* Image Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div 
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="bg-gray-dark border border-primary/10 rounded-2xl overflow-hidden shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              {/* Photo Box */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                {photo.image_url && photo.image_url.match(/\.(mp4|avi)$/i) ? (
                  <video 
                    src={photo.image_url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    muted
                    loop
                    playsInline
                    onMouseOver={e => e.target.play()}
                    onMouseOut={e => e.target.pause()}
                  />
                ) : (
                  <img 
                    src={photo.image_url} 
                    alt={photo.caption || 'Foto del torneo'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                
                {/* Category Badge on Image overlay */}
                <span className={`absolute left-3 top-3 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider backdrop-blur-md ${getTournamentColorClass(photo.tournament)}`}>
                  {getTournamentLabel(photo.tournament)}
                </span>
              </div>

              {/* Detail Block */}
              {photo.caption && (
                <div className="p-4 bg-gray-dark/80">
                  <p className="text-gray-200 text-sm font-medium line-clamp-2">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Immersive Full-Screen Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 animate-fadeIn print:hidden">
          <div className="max-w-4xl w-full flex flex-col items-center">
            {/* Top Bar with actions */}
            <div className="w-full flex justify-between items-center mb-4 text-white">
              <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${getTournamentColorClass(selectedPhoto.tournament)}`}>
                {getTournamentLabel(selectedPhoto.tournament)}
              </span>
              
              <div className="flex gap-4">
                <a 
                  href={selectedPhoto.image_url} 
                  download 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2.5 bg-gray-800 hover:bg-gray-700 hover:text-primary rounded-full transition flex items-center justify-center"
                  title="Abrir imagen original"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2.5 bg-gray-800 hover:bg-gray-700 hover:text-primary rounded-full transition flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Immersive Image Display */}
            <div className="relative max-h-[75vh] max-w-full overflow-hidden rounded-2xl shadow-2xl border border-primary/20 bg-secondary">
              {selectedPhoto.image_url && selectedPhoto.image_url.match(/\.(mp4|avi)$/i) ? (
                <video 
                  src={selectedPhoto.image_url} 
                  controls
                  autoPlay
                  className="max-h-[75vh] max-w-full object-contain mx-auto"
                />
              ) : (
                <img 
                  src={selectedPhoto.image_url} 
                  alt={selectedPhoto.caption || 'Foto del torneo'} 
                  className="max-h-[75vh] max-w-full object-contain mx-auto"
                />
              )}
            </div>

            {/* Bottom Caption */}
            {selectedPhoto.caption && (
              <div className="w-full max-w-2xl text-center mt-6 p-4 rounded-xl bg-gray-dark border border-primary/10">
                <p className="text-gray-100 font-semibold text-lg">{selectedPhoto.caption}</p>
                {selectedPhoto.created_at && (
                  <span className="text-xs text-gray-500 flex items-center justify-center gap-1.5 mt-2">
                    <Calendar className="w-3.5 h-3.5" /> 
                    {new Date(selectedPhoto.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
