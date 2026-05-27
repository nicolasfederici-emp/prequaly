'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Trash2, Edit, Save, X, Plus, Users, Trophy, Megaphone, ShieldAlert,
  HelpCircle, CheckCircle, RefreshCw, Upload, Calendar, Clock, Star, Settings
} from 'lucide-react'

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState('')
  const [activeTab, setActiveTab] = useState('players') // 'players', 'matches', 'news', 'sponsors'
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Players State
  const [players, setPlayers] = useState([])
  const [editingPlayerId, setEditingPlayerId] = useState(null)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [playerForm, setPlayerForm] = useState({ name: '', age: '', hand: 'right', club: '', paid: false, photo_url: '' })

  // Matches State
  const [matches, setMatches] = useState([])
  const [editingMatchId, setEditingMatchId] = useState(null)
  const [matchForm, setMatchForm] = useState({ 
    player1_id: '',
    player2_id: '',
    status: 'scheduled', 
    set1_p1: '', set1_p2: '', 
    set2_p1: '', set2_p2: '', 
    set3_p1: '', set3_p2: '', 
    winner_id: '',
    scheduled_date: '' 
  })
  const [selectedRound, setSelectedRound] = useState(1)

  // News State
  const [news, setNews] = useState([])
  const [editingNewsId, setEditingNewsId] = useState(null)
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [newsForm, setNewsForm] = useState({ title: '', image: '', content: '', date: '' })

  // Sponsors State
  const [sponsors, setSponsors] = useState([])
  const [editingSponsorId, setEditingSponsorId] = useState(null)
  const [showSponsorForm, setShowSponsorForm] = useState(false)
  const [sponsorForm, setSponsorForm] = useState({ name: '', logo_url: '', website: '', description: '', priority: 0 })

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    home_card1_title: '', home_card1_desc: '',
    home_card2_title: '', home_card2_desc: '',
    home_card3_title: '', home_card3_desc: '',
    reglamento_inscripcion: '',
    reglamento_sistema: '',
    reglamento_premios: '',
    logistica_sede: '',
    logistica_hospedaje: '',
    contacto_esteban: '',
    contacto_lucas: '',
    contacto_omar: ''
  })

  const login = (e) => {
    e.preventDefault()
    if (pass === 'admin123') {
      setAuth(true)
      fetchAllData()
    } else {
      setMsg('Contraseña incorrecta')
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchPlayers(),
      fetchMatches(),
      fetchNews(),
      fetchSponsors(),
      fetchSettings()
    ])
    setLoading(false)
  }

  // --- PLAYERS API ---
  const fetchPlayers = async () => {
    const { data, error } = await supabase.from('players').select('*').order('name')
    if (error) console.error('Error fetching players:', error)
    else setPlayers(data || [])
  }

  const savePlayer = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const data = {
      name: playerForm.name,
      age: parseInt(playerForm.age) || 0,
      hand: playerForm.hand,
      club: playerForm.club,
      paid: playerForm.paid,
      photo_url: playerForm.photo_url
    }

    let error
    if (editingPlayerId) {
      const res = await supabase.from('players').update(data).eq('id', editingPlayerId)
      error = res.error
    } else {
      const res = await supabase.from('players').insert([data])
      error = res.error
    }

    if (error) {
      setMsg('Error al guardar jugador: ' + error.message)
    } else {
      setMsg(editingPlayerId ? 'Jugador actualizado correctamente' : 'Jugador cargado correctamente')
      resetPlayerForm()
      fetchPlayers()
    }
    setLoading(false)
  }

  const editPlayer = (player) => {
    setPlayerForm({
      name: player.name,
      age: player.age.toString(),
      hand: player.hand,
      club: player.club || '',
      paid: player.paid,
      photo_url: player.photo_url || ''
    })
    setEditingPlayerId(player.id)
    setShowPlayerForm(true)
  }

  const deletePlayer = async (id, name) => {
    if (!confirm(`¿Eliminar a ${name}?`)) return
    setLoading(true)
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (error) setMsg('Error al eliminar: ' + error.message)
    else {
      setMsg('Jugador eliminado')
      fetchPlayers()
    }
    setLoading(false)
  }

  const resetPlayerForm = () => {
    setPlayerForm({ name: '', age: '', hand: 'right', club: '', paid: false, photo_url: '' })
    setEditingPlayerId(null)
    setShowPlayerForm(false)
  }

  // --- MATCHES API ---
  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id (id, name),
        player2:player2_id (id, name)
      `)
      .order('match_number', { ascending: true })
    if (error) console.error('Error fetching matches:', error)
    else setMatches(data || [])
  }

  // Bracket generator (48 players)
  const generateBracket = async () => {
    if (!confirm('ATENCIÓN: Generar el cuadro eliminará todos los partidos existentes y creará un cuadro de 48 jugadores. ¿Deseas continuar?')) return
    setLoading(true)
    setMsg('')

    try {
      // 1. Delete all existing matches
      const { error: dErr } = await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (dErr) throw new Error('Error al limpiar partidos anteriores: ' + dErr.message)

      // 2. Pair players
      // In a 48-player tournament, we have:
      // - 16 seeds who get a BYE in Round 1
      // - 32 players playing Round 1 (16 matches)
      // The winners of Round 1 play the 16 seeds in Round 2 (16 matches)
      const activePlayers = [...players]
      if (activePlayers.length < 48) {
        // Fill up to 48 dummy players to complete draw if needed
        const diff = 48 - activePlayers.length
        for (let i = 1; i <= diff; i++) {
          activePlayers.push({ id: null, name: `BYE / Vacante ${i}` })
        }
      }

      // First 16 are seeds
      const seeds = activePlayers.slice(0, 16)
      // Remaining 32 are Round 1 contenders
      const r1Players = activePlayers.slice(16, 48)

      const matchesToInsert = []

      // ROUND 1: 16 matches (R48)
      // Match number 1 to 16
      for (let i = 1; i <= 16; i++) {
        const p1 = r1Players[(i - 1) * 2]
        const p2 = r1Players[(i - 1) * 2 + 1]
        matchesToInsert.push({
          round: 1,
          match_number: i,
          player1_id: p1.id,
          player2_id: p2.id,
          status: 'scheduled',
          score1: '',
          score2: '',
          winner_id: null,
          scheduled_date: new Date(2026, 5, 16, 10 + (i % 4), 0).toISOString() // Tuesday June 16
        })
      }

      // ROUND 2: 16 matches (R32)
      // Match number 1 to 16
      // Player 1 is the Seed. Player 2 is the winner of Round 1 Match `i`.
      for (let i = 1; i <= 16; i++) {
        const seed = seeds[i - 1]
        matchesToInsert.push({
          round: 2,
          match_number: i,
          player1_id: seed.id,
          player2_id: null, // Will advance from R1 Match `i`
          status: 'scheduled',
          score1: '',
          score2: '',
          winner_id: null,
          scheduled_date: new Date(2026, 5, 17, 10 + (i % 4), 0).toISOString() // Wednesday June 17
        })
      }

      // ROUND 3: 8 matches (Octavos - R16)
      for (let i = 1; i <= 8; i++) {
        matchesToInsert.push({
          round: 3,
          match_number: i,
          player1_id: null,
          player2_id: null,
          status: 'scheduled',
          score1: '',
          score2: '',
          winner_id: null,
          scheduled_date: new Date(2026, 5, 18, 12 + (i % 3), 0).toISOString() // Thursday June 18
        })
      }

      // ROUND 4: 4 matches (Cuartos - QF)
      for (let i = 1; i <= 4; i++) {
        matchesToInsert.push({
          round: 4,
          match_number: i,
          player1_id: null,
          player2_id: null,
          status: 'scheduled',
          score1: '',
          score2: '',
          winner_id: null,
          scheduled_date: new Date(2026, 5, 19, 14 + (i % 2), 0).toISOString() // Friday June 19
        })
      }

      // ROUND 5: 2 matches (Semis - SF)
      for (let i = 1; i <= 2; i++) {
        matchesToInsert.push({
          round: 5,
          match_number: i,
          player1_id: null,
          player2_id: null,
          status: 'scheduled',
          score1: '',
          score2: '',
          winner_id: null,
          scheduled_date: new Date(2026, 5, 20, 15, 0).toISOString() // Saturday June 20
        })
      }

      // ROUND 6: 1 match (Final - F)
      matchesToInsert.push({
        round: 6,
        match_number: 1,
        player1_id: null,
        player2_id: null,
        status: 'scheduled',
        score1: '',
        score2: '',
        winner_id: null,
        scheduled_date: new Date(2026, 5, 21, 16, 0).toISOString() // Sunday June 21
      })

      // Insert all matches
      const { error: insErr } = await supabase.from('matches').insert(matchesToInsert)
      if (insErr) throw insErr

      setMsg('Cuadro de 48 jugadores generado exitosamente')
      fetchMatches()
    } catch (e) {
      setMsg('Error: ' + e.message)
    }
    setLoading(false)
  }

  const editMatch = (match) => {
    // Parse score: assume format like "6-4 4-6 6-2" or single sets
    const setsP1 = ['', '', '']
    const setsP2 = ['', '', '']
    
    if (match.score1 && match.score2) {
      const s1Parts = match.score1.split(' ')
      const s2Parts = match.score2.split(' ')
      for (let i = 0; i < 3; i++) {
        setsP1[i] = s1Parts[i] || ''
        setsP2[i] = s2Parts[i] || ''
      }
    }

    setMatchForm({
      player1_id: match.player1_id || '',
      player2_id: match.player2_id || '',
      status: match.status,
      set1_p1: setsP1[0], set1_p2: setsP2[0],
      set2_p1: setsP1[1], set2_p2: setsP2[1],
      set3_p1: setsP1[2], set3_p2: setsP2[2],
      winner_id: match.winner_id || '',
      scheduled_date: match.scheduled_date ? match.scheduled_date.slice(0, 16) : ''
    })
    setEditingMatchId(match.id)
  }

  const saveMatch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const match = matches.find(m => m.id === editingMatchId)
    if (!match) return

    // Reconstruct score strings
    const s1 = `${matchForm.set1_p1} ${matchForm.set2_p1} ${matchForm.set3_p1}`.trim()
    const s2 = `${matchForm.set1_p2} ${matchForm.set2_p2} ${matchForm.set3_p2}`.trim()

    const updateData = {
      player1_id: matchForm.player1_id || null,
      player2_id: matchForm.player2_id || null,
      status: matchForm.status,
      score1: s1,
      score2: s2,
      winner_id: matchForm.winner_id || null,
      scheduled_date: matchForm.scheduled_date ? new Date(matchForm.scheduled_date).toISOString() : null
    }

    try {
      // 1. Update the match itself
      const { error: upErr } = await supabase.from('matches').update(updateData).eq('id', editingMatchId)
      if (upErr) throw upErr

      // 2. Advance player if completed
      if (matchForm.status === 'completed' && matchForm.winner_id && match.round < 6) {
        const nextRound = match.round + 1
        const targetMatchNumber = Math.floor((match.match_number - 1) / 2) + 1
        const isPlayer1 = (match.match_number % 2 !== 0)

        // Find the match in the next round
        const nextMatch = matches.find(m => m.round === nextRound && m.match_number === targetMatchNumber)
        if (nextMatch) {
          const advData = isPlayer1 
            ? { player1_id: matchForm.winner_id }
            : { player2_id: matchForm.winner_id }
          
          const { error: advErr } = await supabase.from('matches').update(advData).eq('id', nextMatch.id)
          if (advErr) console.error('Error advancing player:', advErr)
        }
      }

      setMsg('Partido actualizado correctamente')
      setEditingMatchId(null)
      fetchMatches()
    } catch (e) {
      setMsg('Error al guardar partido: ' + e.message)
    }
    setLoading(false)
  }

  // --- NEWS API ---
  const fetchNews = async () => {
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false })
    if (error) console.error('Error fetching news:', error)
    else setNews(data || [])
  }

  const saveNews = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const data = {
      title: newsForm.title,
      image: newsForm.image,
      content: newsForm.content,
      date: newsForm.date || new Date().toISOString().slice(0, 10)
    }

    let error
    if (editingNewsId) {
      const res = await supabase.from('news').update(data).eq('id', editingNewsId)
      error = res.error
    } else {
      const res = await supabase.from('news').insert([data])
      error = res.error
    }

    if (error) {
      setMsg('Error al guardar noticia: ' + error.message)
    } else {
      setMsg('Noticia guardada correctamente')
      resetNewsForm()
      fetchNews()
    }
    setLoading(false)
  }

  const editNews = (n) => {
    setNewsForm({
      title: n.title,
      image: n.image || '',
      content: n.content,
      date: n.date || ''
    })
    setEditingNewsId(n.id)
    setShowNewsForm(true)
  }

  const deleteNews = async (id) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    setLoading(true)
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (error) setMsg('Error al eliminar noticia: ' + error.message)
    else {
      setMsg('Noticia eliminada')
      fetchNews()
    }
    setLoading(false)
  }

  const resetNewsForm = () => {
    setNewsForm({ title: '', image: '', content: '', date: '' })
    setEditingNewsId(null)
    setShowNewsForm(false)
  }

  // --- SPONSORS API ---
  const fetchSponsors = async () => {
    const { data, error } = await supabase.from('sponsors').select('*').order('priority', { ascending: true })
    if (error) console.error('Error fetching sponsors:', error)
    else setSponsors(data || [])
  }

  const saveSponsor = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const data = {
      name: sponsorForm.name,
      logo_url: sponsorForm.logo_url,
      website: sponsorForm.website,
      description: sponsorForm.description,
      priority: parseInt(sponsorForm.priority) || 0
    }

    let error
    if (editingSponsorId) {
      const res = await supabase.from('sponsors').update(data).eq('id', editingSponsorId)
      error = res.error
    } else {
      const res = await supabase.from('sponsors').insert([data])
      error = res.error
    }

    if (error) {
      setMsg('Error al guardar patrocinador: ' + error.message)
    } else {
      setMsg('Patrocinador guardado correctamente')
      resetSponsorForm()
      fetchSponsors()
    }
    setLoading(false)
  }

  const editSponsor = (s) => {
    setSponsorForm({
      name: s.name,
      logo_url: s.logo_url || '',
      website: s.website || '',
      description: s.description || '',
      priority: s.priority || 0
    })
    setEditingSponsorId(s.id)
    setShowSponsorForm(true)
  }

  const deleteSponsor = async (id) => {
    if (!confirm('¿Eliminar este patrocinador?')) return
    setLoading(true)
    const { error } = await supabase.from('sponsors').delete().eq('id', id)
    if (error) setMsg('Error al eliminar patrocinador: ' + error.message)
    else {
      setMsg('Patrocinador eliminado')
      fetchSponsors()
    }
    setLoading(false)
  }

  const resetSponsorForm = () => {
    setSponsorForm({ name: '', logo_url: '', website: '', description: '', priority: 0 })
    setEditingSponsorId(null)
    setShowSponsorForm(false)
  }

  // --- SETTINGS API ---
  const fetchSettings = async () => {
    const { data, error } = await supabase.from('settings').select('*')
    if (error) {
      console.error('Error fetching settings:', error)
    } else if (data) {
      const setMap = {}
      data.forEach(s => {
        setMap[s.key] = s.value
      })
      setSettingsForm(prev => ({
        ...prev,
        ...setMap
      }))
    }
  }

  const saveSettings = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    
    try {
      const upsertData = Object.keys(settingsForm).map(key => ({
        key,
        value: settingsForm[key]
      }))

      const { error } = await supabase.from('settings').upsert(upsertData)
      if (error) throw error

      setMsg('Configuración guardada correctamente')
      fetchSettings()
    } catch (err) {
      setMsg('Error al guardar configuración: ' + err.message)
    }
    setLoading(false)
  }

  // Render Login
  if (!auth) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-sm text-center">
        <h1 className="text-3xl font-bold text-primary mb-6 flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8" />
          Acceso Organización
        </h1>
        <form onSubmit={login} className="space-y-4 bg-gray-dark p-6 rounded-xl border border-primary/20">
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={pass} 
            onChange={e => setPass(e.target.value)} 
            className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" 
          />
          <button className="w-full bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-yellow-400 transition">Entrar</button>
          {msg && <p className="text-red-400 font-medium">{msg}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-primary/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-primary">PANEL DE CONTROL</h1>
          <p className="text-gray-400">Administración general de torneo</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setActiveTab('players'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${activeTab === 'players' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <Users className="w-5 h-5" /> Jugadores
          </button>
          <button 
            onClick={() => { setActiveTab('matches'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${activeTab === 'matches' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <Trophy className="w-5 h-5" /> Partidos
          </button>
          <button 
            onClick={() => { setActiveTab('news'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${activeTab === 'news' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <Megaphone className="w-5 h-5" /> Noticias
          </button>
          <button 
            onClick={() => { setActiveTab('sponsors'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${activeTab === 'sponsors' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <Star className="w-5 h-5" /> Patrocinadores
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${activeTab === 'settings' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <Settings className="w-5 h-5" /> Configuración
          </button>
        </div>
      </div>

      {/* Info Messages */}
      {msg && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 font-medium ${msg.includes('Error') ? 'bg-red-900/30 border border-red-500 text-red-400' : 'bg-green-900/30 border border-green-500 text-green-400'}`}>
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* --- JUGADORES TAB --- */}
      {activeTab === 'players' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Jugadores ({players.length})
            </h2>
            <button 
              onClick={() => { resetPlayerForm(); setShowPlayerForm(true) }}
              className="flex items-center gap-2 bg-primary text-secondary px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
            >
              <Plus className="w-5 h-5" /> Nuevo Jugador
            </button>
          </div>

          {showPlayerForm && (
            <div className="bg-gray-dark p-6 rounded-xl border border-primary/20 mb-8 max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary">{editingPlayerId ? 'Editar Jugador' : 'Nuevo Jugador'}</h3>
                <button onClick={resetPlayerForm} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={savePlayer} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Nombre completo *</label>
                  <input required value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Edad *</label>
                    <input required type="number" value={playerForm.age} onChange={e => setPlayerForm({...playerForm, age: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Mano hábil</label>
                    <select value={playerForm.hand} onChange={e => setPlayerForm({...playerForm, hand: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white">
                      <option value="right">Derecha</option>
                      <option value="left">Izquierda</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Club / Procedencia</label>
                  <input value={playerForm.club} onChange={e => setPlayerForm({...playerForm, club: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Foto URL</label>
                  <input placeholder="https://..." value={playerForm.photo_url} onChange={e => setPlayerForm({...playerForm, photo_url: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={playerForm.paid} onChange={e => setPlayerForm({...playerForm, paid: e.target.checked})} className="w-4 h-4 accent-primary" />
                  <span className="text-gray-300">Inscripción pagada</span>
                </label>
                
                <div className="flex gap-4 pt-2">
                  <button disabled={loading} type="submit" className="flex-1 bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> Guardar
                  </button>
                  <button type="button" onClick={resetPlayerForm} className="px-6 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition">Cancelar</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-gray-dark rounded-xl border border-primary/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-primary/20 text-left">
                  <tr>
                    <th className="px-4 py-3 text-primary font-bold">Foto</th>
                    <th className="px-4 py-3 text-primary font-bold">Nombre</th>
                    <th className="px-4 py-3 text-primary font-bold">Edad</th>
                    <th className="px-4 py-3 text-primary font-bold">Mano</th>
                    <th className="px-4 py-3 text-primary font-bold">Club</th>
                    <th className="px-4 py-3 text-primary font-bold">Pago</th>
                    <th className="px-4 py-3 text-center text-primary font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, idx) => (
                    <tr key={player.id} className={`border-b border-gray-700 ${idx % 2 === 0 ? 'bg-gray-dark' : 'bg-gray-800/50'}`}>
                      <td className="px-4 py-2">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                          {player.photo_url ? <img src={player.photo_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-primary" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-white">{player.name}</td>
                      <td className="px-4 py-3 text-gray-300">{player.age}</td>
                      <td className="px-4 py-3 text-gray-300">{player.hand === 'right' ? 'Derecha' : 'Izquierda'}</td>
                      <td className="px-4 py-3 text-gray-300">{player.club || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${player.paid ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>
                          {player.paid ? 'PAGADO' : 'PENDIENTE'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => editPlayer(player)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deletePlayer(player.id, player.name)} className="p-2 bg-red-600 hover:bg-red-500 rounded text-white transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {players.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400">No hay jugadores cargados en la base de datos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MATCHES TAB --- */}
      {activeTab === 'matches' && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Gestión de Partidos ({matches.length})
            </h2>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={generateBracket}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
              >
                <RefreshCw className="w-5 h-5" /> Generar Cuadro de 48
              </button>
            </div>
          </div>

          {players.length < 32 && (
            <div className="bg-yellow-950/30 border border-yellow-500 text-yellow-400 p-4 rounded-lg mb-6 flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Se necesitan al menos 32 jugadores registrados para generar el bracket (actualmente hay {players.length}). Si generas el cuadro, los espacios vacíos se completarán automáticamente con "BYE / Vacante".
              </p>
            </div>
          )}

          {/* Round Selector Tab */}
          <div className="flex gap-1 overflow-x-auto bg-gray-dark p-1.5 rounded-lg border border-primary/20 mb-6">
            {[1, 2, 3, 4, 5, 6].map(r => (
              <button
                key={r}
                onClick={() => setSelectedRound(r)}
                className={`flex-1 min-w-[100px] text-center py-2 px-3 rounded-md font-bold transition text-sm ${selectedRound === r ? 'bg-primary text-secondary shadow-md' : 'text-gray-400 hover:text-primary'}`}
              >
                {r === 1 ? 'Ronda de 48' : r === 2 ? 'Ronda de 32' : r === 3 ? 'Octavos' : r === 4 ? 'Cuartos' : r === 5 ? 'Semis' : 'Final'}
              </button>
            ))}
          </div>

          {/* Edit Match Modal */}
          {editingMatchId && (
            <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-gray-dark p-6 rounded-xl border-2 border-primary/30 max-w-3xl w-full relative shadow-2xl my-8">
                <button 
                  type="button"
                  onClick={() => setEditingMatchId(null)} 
                  className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-xl font-bold text-primary mb-4">Cargar Resultado de Partido</h3>
                
                <form onSubmit={saveMatch} className="space-y-6">
                  {/* Match Information - Player Selectors */}
                  <div className="grid md:grid-cols-2 gap-6 bg-secondary/50 p-4 rounded-lg border border-primary/10">
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm font-bold text-primary">Jugador 1</label>
                      <select 
                        value={matchForm.player1_id} 
                        onChange={e => setMatchForm({...matchForm, player1_id: e.target.value})} 
                        className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="">Rival a confirmar</option>
                        {players.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.club || 'Sin club'})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm font-bold text-primary">Jugador 2</label>
                      <select 
                        value={matchForm.player2_id} 
                        onChange={e => setMatchForm({...matchForm, player2_id: e.target.value})} 
                        className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="">Rival a confirmar</option>
                        {players.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.club || 'Sin club'})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Status, Date and Time */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">Estado del Partido</label>
                        <select 
                          value={matchForm.status} 
                          onChange={e => setMatchForm({...matchForm, status: e.target.value})} 
                          className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white"
                        >
                          <option value="scheduled">Programado</option>
                          <option value="live">En Vivo</option>
                          <option value="completed">Finalizado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">Fecha y Hora Programada</label>
                        <input 
                          type="datetime-local" 
                          value={matchForm.scheduled_date} 
                          onChange={e => setMatchForm({...matchForm, scheduled_date: e.target.value})} 
                          className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" 
                        />
                      </div>
                    </div>

                    {/* Score Entry */}
                    <div className="space-y-3">
                      <label className="block text-gray-300 text-sm font-medium">Marcador por Sets</label>
                      <div className="grid grid-cols-4 gap-2 text-center items-center">
                        <span className="text-xs text-gray-400">Set</span>
                        <span className="text-xs text-primary">J1</span>
                        <span className="text-xs text-primary">J2</span>
                        <span></span>

                        <span className="font-bold text-sm text-gray-300">Set 1:</span>
                        <input type="number" placeholder="0" value={matchForm.set1_p1} onChange={e => setMatchForm({...matchForm, set1_p1: e.target.value})} className="bg-secondary border border-primary/30 rounded py-1 px-2 text-center text-white" />
                        <input type="number" placeholder="0" value={matchForm.set1_p2} onChange={e => setMatchForm({...matchForm, set1_p2: e.target.value})} className="bg-secondary border border-primary/30 rounded py-1 px-2 text-center text-white" />
                        <span></span>

                        <span className="font-bold text-sm text-gray-300">Set 2:</span>
                        <input type="number" placeholder="0" value={matchForm.set2_p1} onChange={e => setMatchForm({...matchForm, set2_p1: e.target.value})} className="bg-secondary border border-primary/30 rounded py-1 px-2 text-center text-white" />
                        <input type="number" placeholder="0" value={matchForm.set2_p2} onChange={e => setMatchForm({...matchForm, set2_p2: e.target.value})} className="bg-secondary border border-primary/30 rounded py-1 px-2 text-center text-white" />
                        <span></span>

                        <span className="font-bold text-sm text-gray-300">Set 3:</span>
                        <input type="number" placeholder="0" value={matchForm.set3_p1} onChange={e => setMatchForm({...matchForm, set3_p1: e.target.value})} className="bg-secondary border border-primary/30 rounded py-1 px-2 text-center text-white" />
                        <input type="number" placeholder="0" value={matchForm.set3_p2} onChange={e => setMatchForm({...matchForm, set3_p2: e.target.value})} className="bg-secondary border border-primary/30 rounded py-1 px-2 text-center text-white" />
                        <span></span>
                      </div>
                    </div>
                  </div>

                  {/* Winner selection - required if status is completed */}
                  {matchForm.status === 'completed' && (
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm font-bold text-primary">Ganador *</label>
                      <select 
                        required
                        value={matchForm.winner_id} 
                        onChange={e => setMatchForm({...matchForm, winner_id: e.target.value})} 
                        className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="">Selecciona al ganador...</option>
                        {matchForm.player1_id && (
                          <option value={matchForm.player1_id}>
                            {players.find(p => p.id === matchForm.player1_id)?.name || 'Jugador 1'}
                          </option>
                        )}
                        {matchForm.player2_id && (
                          <option value={matchForm.player2_id}>
                            {players.find(p => p.id === matchForm.player2_id)?.name || 'Jugador 2'}
                          </option>
                        )}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                    <button disabled={loading} type="submit" className="flex-1 bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" /> Guardar Resultado
                    </button>
                    <button type="button" onClick={() => setEditingMatchId(null)} className="px-6 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition">Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Matches List Grouped by Selected Round */}
          <div className="grid md:grid-cols-2 gap-4">
            {matches.filter(m => m.round === selectedRound).map(match => (
              <div key={match.id} className="bg-gray-dark p-6 rounded-xl border border-primary/20 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold bg-secondary px-2.5 py-1 rounded text-primary border border-primary/10">
                      Partido #{match.match_number}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded font-bold ${match.status === 'completed' ? 'bg-green-900/50 text-green-400' : match.status === 'live' ? 'bg-yellow-950/50 text-yellow-400 border border-yellow-700' : 'bg-gray-800 text-gray-400'}`}>
                      {match.status === 'completed' ? 'Finalizado' : match.status === 'live' ? 'En Vivo' : 'Programado'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className={`flex justify-between items-center p-2 rounded ${match.winner_id === match.player1_id && match.status === 'completed' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-300'}`}>
                      <span>{match.player1?.name || 'Rival a confirmar'}</span>
                      <span className="font-mono text-sm">{match.status === 'completed' && match.score1 ? match.score1 : '-'}</span>
                    </div>
                    <div className={`flex justify-between items-center p-2 rounded ${match.winner_id === match.player2_id && match.status === 'completed' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-300'}`}>
                      <span>{match.player2?.name || 'Rival a confirmar'}</span>
                      <span className="font-mono text-sm">{match.status === 'completed' && match.score2 ? match.score2 : '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-primary/10 pt-4 mt-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {match.scheduled_date ? new Date(match.scheduled_date).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Sin fecha'}
                  </span>
                  
                  <button 
                    onClick={() => editMatch(match)}
                    className="flex items-center gap-1.5 bg-secondary text-primary border border-primary/30 px-3.5 py-1.5 rounded-lg hover:bg-primary hover:text-secondary transition text-sm font-bold"
                  >
                    <Edit className="w-4 h-4" /> Cargar
                  </button>
                </div>
              </div>
            ))}
            {matches.filter(m => m.round === selectedRound).length === 0 && (
              <div className="col-span-2 p-8 text-center text-gray-400 bg-gray-dark rounded-xl border border-primary/10">
                No hay partidos generados en esta ronda. Haz clic en "Generar Cuadro de 48" arriba para empezar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- NEWS TAB --- */}
      {activeTab === 'news' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" />
              Noticias ({news.length})
            </h2>
            <button 
              onClick={() => { resetNewsForm(); setShowNewsForm(true) }}
              className="flex items-center gap-2 bg-primary text-secondary px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
            >
              <Plus className="w-5 h-5" /> Nueva Noticia
            </button>
          </div>

          {showNewsForm && (
            <div className="bg-gray-dark p-6 rounded-xl border border-primary/20 mb-8 max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary">{editingNewsId ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
                <button onClick={resetNewsForm} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={saveNews} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Título de la noticia *</label>
                  <input required value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Fecha de publicación</label>
                    <input type="date" value={newsForm.date} onChange={e => setNewsForm({...newsForm, date: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Imagen URL</label>
                    <input placeholder="https://..." value={newsForm.image} onChange={e => setNewsForm({...newsForm, image: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Contenido de la Noticia *</label>
                  <textarea required rows="6" value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white"></textarea>
                </div>
                
                <div className="flex gap-4 pt-2">
                  <button disabled={loading} type="submit" className="flex-1 bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> Guardar Noticia
                  </button>
                  <button type="button" onClick={resetNewsForm} className="px-6 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition">Cancelar</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {news.map(n => (
              <div key={n.id} className="bg-gray-dark rounded-xl border border-primary/20 overflow-hidden flex flex-col justify-between">
                <div>
                  {n.image && <img src={n.image} alt={n.title} className="w-full h-48 object-cover border-b border-primary/20" />}
                  <div className="p-6">
                    <span className="text-xs text-primary font-bold block mb-1">{n.date}</span>
                    <h3 className="text-xl font-bold text-white mb-2">{n.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3">{n.content}</p>
                  </div>
                </div>
                <div className="p-6 border-t border-primary/10 flex justify-end gap-2 bg-secondary/20">
                  <button onClick={() => editNews(n)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteNews(n.id)} className="p-2 bg-red-600 hover:bg-red-500 rounded text-white transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {news.length === 0 && (
              <div className="col-span-2 p-8 text-center text-gray-400 bg-gray-dark rounded-xl border border-primary/10">
                No hay noticias cargadas. Haz clic en "Nueva Noticia" para comenzar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SPONSORS TAB --- */}
      {activeTab === 'sponsors' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              Patrocinadores ({sponsors.length})
            </h2>
            <button 
              onClick={() => { resetSponsorForm(); setShowSponsorForm(true) }}
              className="flex items-center gap-2 bg-primary text-secondary px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
            >
              <Plus className="w-5 h-5" /> Nuevo Patrocinador
            </button>
          </div>

          {showSponsorForm && (
            <div className="bg-gray-dark p-6 rounded-xl border border-primary/20 mb-8 max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary">{editingSponsorId ? 'Editar Patrocinador' : 'Nuevo Patrocinador'}</h3>
                <button onClick={resetSponsorForm} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={saveSponsor} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Nombre de la Empresa *</label>
                  <input required value={sponsorForm.name} onChange={e => setSponsorForm({...sponsorForm, name: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Prioridad de Visualización (0 = Alta)</label>
                    <input type="number" placeholder="0" value={sponsorForm.priority} onChange={e => setSponsorForm({...sponsorForm, priority: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Logo URL</label>
                    <input placeholder="https://..." value={sponsorForm.logo_url} onChange={e => setSponsorForm({...sponsorForm, logo_url: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Sitio Web URL</label>
                  <input placeholder="https://..." value={sponsorForm.website} onChange={e => setSponsorForm({...sponsorForm, website: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Descripción corta</label>
                  <textarea rows="3" value={sponsorForm.description} onChange={e => setSponsorForm({...sponsorForm, description: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white"></textarea>
                </div>
                
                <div className="flex gap-4 pt-2">
                  <button disabled={loading} type="submit" className="flex-1 bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> Guardar Patrocinador
                  </button>
                  <button type="button" onClick={resetSponsorForm} className="px-6 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition">Cancelar</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sponsors.map(s => (
              <div key={s.id} className="bg-gray-dark rounded-xl border border-primary/20 overflow-hidden p-6 flex flex-col justify-between">
                <div className="text-center">
                  <div className="w-full h-24 bg-secondary rounded-lg mb-4 flex items-center justify-center p-2 border border-primary/10 overflow-hidden">
                    {s.logo_url ? <img src={s.logo_url} alt={s.name} className="max-h-full max-w-full object-contain" /> : <Star className="w-8 h-8 text-primary" />}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{s.name}</h3>
                  <span className="text-xs text-primary font-mono block mb-2">Prioridad: {s.priority}</span>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{s.description || 'Sin descripción'}</p>
                </div>
                <div className="border-t border-primary/10 pt-4 flex justify-end gap-2 bg-secondary/10 -mx-6 -mb-6 p-4 mt-2">
                  <button onClick={() => editSponsor(s)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteSponsor(s.id)} className="p-2 bg-red-600 hover:bg-red-500 rounded text-white transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {sponsors.length === 0 && (
              <div className="col-span-3 p-8 text-center text-gray-400 bg-gray-dark rounded-xl border border-primary/10">
                No hay patrocinadores cargados. Haz clic en "Nuevo Patrocinador" para comenzar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SETTINGS TAB --- */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Configuración de Textos de la Web
            </h2>
            <p className="text-gray-400 text-sm mt-1">Modifica los contenidos de las tarjetas de inicio y la página de reglamento</p>
          </div>

          <form onSubmit={saveSettings} className="space-y-8 bg-gray-dark p-6 rounded-xl border border-primary/20">
            {/* Home Cards Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-2">1. Tarjetas de Información del Inicio</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div className="space-y-3 bg-secondary/30 p-4 rounded-lg border border-primary/5">
                  <span className="text-xs font-bold text-primary block">Tarjeta 1 (Inscripciones)</span>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Título</label>
                    <input value={settingsForm.home_card1_title} onChange={e => setSettingsForm({...settingsForm, home_card1_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Contenido</label>
                    <textarea rows="4" value={settingsForm.home_card1_desc} onChange={e => setSettingsForm({...settingsForm, home_card1_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-xs text-white"></textarea>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="space-y-3 bg-secondary/30 p-4 rounded-lg border border-primary/5">
                  <span className="text-xs font-bold text-primary block">Tarjeta 2 (Premios)</span>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Título</label>
                    <input value={settingsForm.home_card2_title} onChange={e => setSettingsForm({...settingsForm, home_card2_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Contenido</label>
                    <textarea rows="4" value={settingsForm.home_card2_desc} onChange={e => setSettingsForm({...settingsForm, home_card2_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-xs text-white"></textarea>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="space-y-3 bg-secondary/30 p-4 rounded-lg border border-primary/5">
                  <span className="text-xs font-bold text-primary block">Tarjeta 3 (Hospedaje)</span>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Título</label>
                    <input value={settingsForm.home_card3_title} onChange={e => setSettingsForm({...settingsForm, home_card3_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Contenido</label>
                    <textarea rows="4" value={settingsForm.home_card3_desc} onChange={e => setSettingsForm({...settingsForm, home_card3_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-xs text-white"></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Reglamento Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-2">2. Contenido de la Página de Reglamento</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">1. Inscripción (Detalles)</label>
                  <textarea rows="6" value={settingsForm.reglamento_inscripcion} onChange={e => setSettingsForm({...settingsForm, reglamento_inscripcion: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded p-3 text-sm text-white"></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">2. Sistema de Juego (Detalles)</label>
                  <textarea rows="6" value={settingsForm.reglamento_sistema} onChange={e => setSettingsForm({...settingsForm, reglamento_sistema: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded p-3 text-sm text-white"></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">3. Premios (Detalles)</label>
                  <textarea rows="6" value={settingsForm.reglamento_premios} onChange={e => setSettingsForm({...settingsForm, reglamento_premios: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded p-3 text-sm text-white"></textarea>
                </div>
              </div>
            </div>

            {/* Logística & Hospedaje Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-2">3. Sede y Hospedaje</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Información de la Sede (Club Empalme)</label>
                  <textarea rows="3" value={settingsForm.logistica_sede} onChange={e => setSettingsForm({...settingsForm, logistica_sede: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded p-3 text-sm text-white"></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Información de Alojamiento (Club Náutico)</label>
                  <textarea rows="3" value={settingsForm.logistica_hospedaje} onChange={e => setSettingsForm({...settingsForm, logistica_hospedaje: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded p-3 text-sm text-white"></textarea>
                </div>
              </div>
            </div>

            {/* Contactos Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-2">4. Teléfonos de Contacto</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Esteban Spinetta (Teléfono)</label>
                  <input value={settingsForm.contacto_esteban} onChange={e => setSettingsForm({...settingsForm, contacto_esteban: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Lucas Mazzei (Teléfono)</label>
                  <input value={settingsForm.contacto_lucas} onChange={e => setSettingsForm({...settingsForm, contacto_lucas: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Omar Descarrega (Teléfono/Texto)</label>
                  <input value={settingsForm.contacto_omar} onChange={e => setSettingsForm({...settingsForm, contacto_omar: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-primary/15">
              <button disabled={loading} type="submit" className="w-full bg-primary text-secondary font-black py-4 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2 shadow-lg">
                <Save className="w-5 h-5" /> GUARDAR TODOS LOS CAMBIOS
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}