'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Trophy, Calendar, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FichaJugadorPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  
  const [player, setPlayer] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchPlayerData()
    }
  }, [id])

  const fetchPlayerData = async () => {
    setLoading(true)
    
    // Fetch player details
    const { data: playerData, error: pError } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single()

    if (pError) {
      console.error('Error fetching player:', pError)
      setLoading(false)
      return
    }

    setPlayer(playerData)

    // Fetch matches for this player
    const { data: matchData, error: mError } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id (id, name),
        player2:player2_id (id, name)
      `)
      .or(`player1_id.eq.${id},player2_id.eq.${id}`)
      .order('round', { ascending: true })

    if (mError) {
      console.error('Error fetching player matches:', mError)
    } else {
      setMatches(matchData || [])
    }

    setLoading(false)
  }

  const getRoundName = (roundNum) => {
    switch (roundNum) {
      case 1: return 'Ronda de 48'
      case 2: return 'Ronda de 32'
      case 3: return 'Octavos de Final'
      case 4: return 'Cuartos de Final'
      case 5: return 'Semifinal'
      case 6: return 'Final'
      default: return `Ronda ${roundNum}`
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-primary">
        Cargando ficha de jugador...
      </div>
    )
  }

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-red-400 mb-4">Jugador no encontrado.</p>
        <button onClick={() => router.push('/jugadores')} className="bg-primary text-secondary px-6 py-2 rounded-lg font-bold">
          Volver a Jugadores
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/jugadores" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition mb-8">
        <ArrowLeft className="w-5 h-5" />
        Volver a Jugadores
      </Link>

      {/* Tarjeta Perfil Principal */}
      <div className="bg-gray-dark rounded-2xl border-2 border-primary/20 overflow-hidden mb-8">
        <div className="md:flex items-center p-8 gap-8">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/50 bg-secondary flex items-center justify-center overflow-hidden mx-auto md:mx-0 flex-shrink-0">
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-20 h-20 text-primary" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left mt-6 md:mt-0">
            <h1 className="text-4xl font-bold text-primary mb-2">{player.name}</h1>
            <p className="text-xl text-gray-300 mb-4">{player.club || 'Club no especificado'}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-400 mb-6">
              <div className="bg-secondary/50 p-3 rounded-lg border border-primary/10">
                <span className="block text-xs text-gray-500">EDAD</span>
                <span className="text-lg font-bold text-white">{player.age} años</span>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg border border-primary/10">
                <span className="block text-xs text-gray-500">MANO HÁBIL</span>
                <span className="text-lg font-bold text-white">
                  {player.hand === 'right' ? 'Derecha' : 'Izquierda'}
                </span>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg border border-primary/10 col-span-2 md:col-span-1">
                <span className="block text-xs text-gray-500">INSCRIPCIÓN</span>
                <span className={`text-lg font-bold flex items-center gap-1.5 justify-center md:justify-start ${player.paid ? 'text-green-400' : 'text-red-400'}`}>
                  {player.paid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Pagado
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Pendiente
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Partidos */}
      <div>
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Historial de Partidos
        </h2>

        {matches.length === 0 ? (
          <div className="bg-gray-dark border border-primary/10 rounded-xl p-8 text-center text-gray-400">
            Este jugador aún no ha disputado partidos en el torneo.
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(match => {
              const isPlayer1 = match.player1_id === id
              const opponent = isPlayer1 ? match.player2 : match.player1
              const isWinner = match.winner_id === id
              const isCompleted = match.status === 'completed'
              const score = isPlayer1 
                ? `${match.score1 || ''} / ${match.score2 || ''}`
                : `${match.score2 || ''} / ${match.score1 || ''}`

              return (
                <div key={match.id} className="bg-gray-dark border border-primary/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-primary font-bold block mb-1">{getRoundName(match.round)}</span>
                    <h3 className="text-lg font-bold text-white">
                      vs {opponent ? opponent.name : 'Rival a confirmar'}
                    </h3>
                    <span className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      {match.scheduled_date ? new Date(match.scheduled_date).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Fecha no programada'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto">
                    {isCompleted ? (
                      <>
                        <span className="text-lg font-mono font-bold bg-secondary px-4 py-2 rounded-lg border border-primary/20">
                          {score}
                        </span>
                        <span className={`px-3 py-1 rounded text-sm font-bold ${isWinner ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>
                          {isWinner ? 'Ganó' : 'Perdió'}
                        </span>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded text-sm font-bold bg-gray-800 text-gray-400 border border-gray-700">
                        {match.status === 'live' ? 'En Vivo' : 'Programado'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
