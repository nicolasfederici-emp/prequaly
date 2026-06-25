'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Trash2, Edit, Save, X, Plus, Users, Trophy, Megaphone, ShieldAlert,
  CheckCircle, RefreshCw, Upload, Calendar, Star, Settings, Camera, LayoutGrid, Clock, Download
} from 'lucide-react'
import Bracket from '@/components/Bracket'

const getMaxRound = (tournament) => {
  if (tournament === 'prequaly') return 6
  if (tournament === 'qualy' || tournament === 'm15_singles') return 5
  if (tournament === 'm15_doubles') return 4
  return 1
}

const getRoundNameLabel = (roundNum, tournament) => {
  if (tournament === 'prequaly') {
    switch (roundNum) {
      case 1: return 'Ronda 1 (R48)'
      case 2: return 'Ronda 2 (R32)'
      case 3: return 'Octavos'
      case 4: return 'Cuartos'
      case 5: return 'Semis'
      case 6: return 'Final'
      default: return `Ronda ${roundNum}`
    }
  } else if (tournament === 'qualy' || tournament === 'm15_singles') {
    switch (roundNum) {
      case 1: return 'Ronda 1 (R32)'
      case 2: return 'Octavos'
      case 3: return 'Cuartos'
      case 4: return 'Semis'
      case 5: return 'Final'
      default: return `Ronda ${roundNum}`
    }
  } else if (tournament === 'm15_doubles') {
    switch (roundNum) {
      case 1: return 'Ronda 1 (R16)'
      case 2: return 'Cuartos'
      case 3: return 'Semis'
      case 4: return 'Final'
      default: return `Ronda ${roundNum}`
    }
  }
  return `Ronda ${roundNum}`
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState('')
  const [activeTab, setActiveTab] = useState('players') // 'players', 'matches', 'news', 'sponsors', 'gallery', 'settings'
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Players State
  const [players, setPlayers] = useState([])
  const [playerFilter, setPlayerFilter] = useState('all')
  const [playerSearch, setPlayerSearch] = useState('')
  const [editingPlayerId, setEditingPlayerId] = useState(null)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [playerForm, setPlayerForm] = useState({ name: '', age: '', hand: 'right', club: '', paid: false, photo_url: '', tournament: 'prequaly' })

  // Auto-Draw State
  const [showSeedModal, setShowSeedModal] = useState(false)
  const [selectedSeedTournament, setSelectedSeedTournament] = useState('prequaly')
  const [localSeeds, setLocalSeeds] = useState({})

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
    scheduled_date: '',
    court: ''
  })
  const [selectedMatchTournament, setSelectedMatchTournament] = useState('prequaly')
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
  const [sponsorForm, setSponsorForm] = useState({ name: '', logo_url: '', website: '', description: '', priority: 0, category: 'colaborador' })

  // Gallery State
  const [gallery, setGallery] = useState([])
  const [editingGalleryId, setEditingGalleryId] = useState(null)
  const [showGalleryForm, setShowGalleryForm] = useState(false)
  const [galleryForm, setGalleryForm] = useState({ image_url: '', caption: '', tournament: 'general' })

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    informacion_torneo: '',
    logistica_sede: '',
    contacto_esteban: '',
    contacto_lucas: '',
    contacto_omar: '',
    home_hero_bg_image: '',
    home_hero_title: '',
    home_hero_subtitle: '',
    home_hero_desc: '',
    home_stats_1: '',
    home_stats_2: '',
    home_stats_3: '',
    home_fases_title: '',
    home_fases_desc: '',
    fase1_name: '',
    fase1_date: '',
    fase1_title: '',
    fase1_desc: '',
    fase1_venue: '',
    fase2_name: '',
    fase2_date: '',
    fase2_title: '',
    fase2_desc: '',
    fase2_venue: '',
    fase3_name: '',
    fase3_date: '',
    fase3_title: '',
    fase3_desc: '',
    fase3_venue: '',
    home_news_title: '',
    home_sponsors_title: '',
    reglas_main_title: '',
    reglas_main_desc: '',
    reglas_sec1_title: '',
    reglas_sec2_title: '',
    reglas_sec3_title: '',
    home_badge_text: '',
    contacto_nombre_1: '',
    contacto_rol_1: '',
    contacto_nombre_2: '',
    contacto_rol_2: '',
    contacto_nombre_3: '',
    contacto_rol_3: '',
    nav_brand_text: '',
    sede_principal_nombre: '',
    sede_principal_direccion: '',
    sede_principal_desc: '',
    sede_principal_mapa: '',
    sede_prequaly_nombre: '',
    sede_prequaly_direccion: '',
    sede_prequaly_desc: '',
    sede_prequaly_mapa: '',
    carousel_speed: '40',
    instagram_widget_code: '',
    theme_primary: '#D0FD3E',
    theme_secondary: '#081411',
    theme_clay: '#C2563C',
    theme_gray_dark: '#111E1A',
    theme_text: '#ffffff'
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
      fetchGallery(),
      fetchSettings()
    ])
    setLoading(false)
  }

  // --- REUSABLE STORAGE UPLOAD ---
  const uploadFile = async (e, fieldName, formState, setFormState) => {
    let file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setMsg('Procesando y subiendo archivo...')
    
    try {
      let fileExt = file.name.split('.').pop().toLowerCase()
      
      if (fileExt === 'heic' || fileExt === 'heif') {
        setMsg('Convirtiendo formato HEIC para compatibilidad web...')
        const heic2any = (await import('heic2any')).default
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        })
        const blobArray = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob]
        file = new File([blobArray[0]], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
          type: 'image/jpeg'
        })
        fileExt = 'jpg'
        setMsg('Subiendo archivo convertido a Supabase...')
      }
      
      const fileName = `${fieldName}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(fileName, file)
        
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName)
        
      setFormState({ ...formState, [fieldName]: publicUrl })
      setMsg('Imagen subida y enlazada correctamente')
    } catch (err) {
      console.error(err)
      setMsg('Error al subir imagen: ' + err.message)
    }
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
      photo_url: playerForm.photo_url,
      tournament: playerForm.tournament
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
      photo_url: player.photo_url || '',
      tournament: player.tournament || 'prequaly'
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
    setPlayerForm({ name: '', age: '', hand: 'right', club: '', paid: false, photo_url: '', tournament: 'prequaly' })
    setEditingPlayerId(null)
    setShowPlayerForm(false)
  }

  const exportPlayersCSV = () => {
    if (players.length === 0) return setMsg('No hay jugadores para exportar')
    
    const headers = ['Nombre', 'Torneo', 'Edad', 'Mano', 'Club', 'Pagado', 'Fecha de Registro']
    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...players.map(p => [
        `"${p.name}"`,
        `"${p.tournament}"`,
        p.age,
        `"${p.hand}"`,
        `"${p.club || ''}"`,
        p.paid ? 'SI' : 'NO',
        `"${new Date(p.created_at).toLocaleDateString()}"`
      ].join(';'))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `jugadores_inscritos_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  const getMaxRound = (tourn) => {
    if (tourn === 'prequaly') return 6
    if (tourn === 'qualy' || tourn === 'm15_singles') return 5
    if (tourn === 'm15_doubles') return 4
    return 6
  }

  const getRoundNameLabel = (rNum, tourn) => {
    if (tourn === 'prequaly') {
      return rNum === 1 ? 'Ronda de 48' : rNum === 2 ? 'Ronda de 32' : rNum === 3 ? 'Octavos' : rNum === 4 ? 'Cuartos' : rNum === 5 ? 'Semis' : 'Final'
    } else if (tourn === 'qualy' || tourn === 'm15_singles') {
      return rNum === 1 ? 'Ronda de 32' : rNum === 2 ? 'Octavos' : rNum === 3 ? 'Cuartos' : rNum === 4 ? 'Semis' : 'Final'
    } else if (tourn === 'm15_doubles') {
      return rNum === 1 ? 'Octavos' : rNum === 2 ? 'Cuartos' : rNum === 3 ? 'Semis' : 'Final'
    }
    return `Ronda ${rNum}`
  }

  // --- AUTO DRAW LOGIC ---
  const handleAutoDraw = async () => {
    if (!confirm(`¿Estás seguro? Esto ELIMINARÁ todos los partidos actuales de ${selectedSeedTournament.toUpperCase()} y generará un nuevo cuadro. Asegúrate de tener guardados los datos importantes.`)) return;
    setLoading(true);
    setMsg('Generando cuadro automáticamente...');

    try {
      // 1. Get players for this tournament
      const tournPlayers = players.filter(p => p.tournament === selectedSeedTournament);
      
      // 2. Parse seeds
      const seededPlayers = []; 
      const unseededPlayers = [];
      
      tournPlayers.forEach(p => {
        const seedStr = localSeeds[p.id];
        const s = parseInt(seedStr);
        if (s && !isNaN(s)) {
          seededPlayers.push({ player: p, seed: s });
        } else {
          unseededPlayers.push(p);
        }
      });
      
      // Shuffle unseeded players
      for (let i = unseededPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unseededPlayers[i], unseededPlayers[j]] = [unseededPlayers[j], unseededPlayers[i]];
      }

      // 3. Determine draw size
      let drawSize = 32;
      let SEED_SLOTS = { 1: 1, 2: 32, 3: 9, 4: 24, 5: 8, 6: 16, 7: 17, 8: 25 };
      if (selectedSeedTournament === 'prequaly') {
        drawSize = 64;
        SEED_SLOTS = { 1: 1, 2: 64, 3: 17, 4: 48, 5: 16, 6: 32, 7: 33, 8: 49, 9: 8, 10: 9, 11: 24, 12: 25, 13: 40, 14: 41, 15: 56, 16: 57 };
      } else if (selectedSeedTournament === 'm15_doubles') {
        drawSize = 16;
        SEED_SLOTS = { 1: 1, 2: 16, 3: 5, 4: 12 };
      }
      
      // 4. Fill slots (1-indexed array)
      const slots = new Array(drawSize + 1).fill(null);
      
      seededPlayers.forEach(({player, seed}) => {
        const pos = SEED_SLOTS[seed];
        if (pos) {
          slots[pos] = player;
        } else {
          unseededPlayers.push(player); 
        }
      });
      
      const numByes = drawSize - tournPlayers.length;
      for (let s = 1; s <= numByes; s++) {
        const seedPos = SEED_SLOTS[s];
        if (seedPos) {
          const oppPos = seedPos % 2 === 0 ? seedPos - 1 : seedPos + 1;
          slots[oppPos] = 'BYE';
        }
      }
      
      for (let i = 1; i <= drawSize; i++) {
        if (slots[i] === null) {
          if (unseededPlayers.length > 0) {
            slots[i] = unseededPlayers.pop();
          } else {
            slots[i] = 'BYE';
          }
        }
      }

      // 5. Generate database records
      const { error: dErr } = await supabase.from('matches').delete().eq('tournament', selectedSeedTournament);
      if (dErr) throw new Error('Error al limpiar partidos anteriores: ' + dErr.message);

      const matchesToInsert = [];
      const numMatchesR1 = drawSize / 2;
      
      for (let i = 1; i <= numMatchesR1; i++) {
        const p1 = slots[i * 2 - 1];
        const p2 = slots[i * 2];
        
        let m = {
          round: 1,
          match_number: i,
          tournament: selectedSeedTournament,
          status: 'pending',
          score1: '', score2: '', winner_id: null,
          player1_id: p1 && p1 !== 'BYE' ? p1.id : null,
          player2_id: p2 && p2 !== 'BYE' ? p2.id : null,
        };
        
        if (p1 === 'BYE' || p2 === 'BYE') {
          m.status = 'completed';
          m.score1 = 'BYE';
          if (p1 !== 'BYE' && p1) m.winner_id = p1.id;
          if (p2 !== 'BYE' && p2) m.winner_id = p2.id;
        }
        matchesToInsert.push(m);
      }
      
      const totalRounds = Math.log2(drawSize);
      for (let r = 2; r <= totalRounds; r++) {
        const matchesInRound = drawSize / Math.pow(2, r);
        for (let i = 1; i <= matchesInRound; i++) {
          matchesToInsert.push({
            round: r,
            match_number: i,
            tournament: selectedSeedTournament,
            status: 'pending',
            score1: '', score2: '', winner_id: null,
            player1_id: null, player2_id: null
          });
        }
      }
      
      const { data: insertedMatches, error: insErr } = await supabase.from('matches').insert(matchesToInsert).select();
      if (insErr) throw insErr;
      
      // Push BYE winners to R2
      const r1Matches = insertedMatches.filter(m => m.round === 1 && m.status === 'completed' && m.winner_id);
      for (const m of r1Matches) {
        const targetMatchNumber = Math.floor((m.match_number - 1) / 2) + 1;
        const isPlayer1 = (m.match_number % 2 !== 0);
        
        const nextMatch = insertedMatches.find(nm => nm.round === 2 && nm.match_number === targetMatchNumber);
        if (nextMatch) {
          const advData = isPlayer1 ? { player1_id: m.winner_id } : { player2_id: m.winner_id };
          await supabase.from('matches').update(advData).eq('id', nextMatch.id);
        }
      }

      // Save seeds
      const settingKey = `${selectedSeedTournament}_seeds`;
      await supabase.from('settings').upsert({ key: settingKey, value: JSON.stringify(localSeeds) });

      setMsg('Cuadro generado automáticamente con éxito.');
      setShowSeedModal(false);
      fetchMatches();
      
    } catch (e) {
      setMsg('Error: ' + e.message);
    }
    setLoading(false);
  }

  // Bracket Structure Generator (Empty)
  const generateBracketStructure = async (tourn) => {
    const labels = {
      prequaly: 'PreQualy (48 jugadores)',
      qualy: 'Qualy (32 jugadores)',
      m15_singles: 'M15 Singles (32 jugadores)',
      m15_doubles: 'M15 Doubles (16 parejas)'
    }

    if (!confirm(`ATENCIÓN: Generar el cuadro de ${labels[tourn]} eliminará todos los partidos existentes de ESTE torneo en la base de datos. ¿Deseas continuar?`)) return
    setLoading(true)
    setMsg('')

    try {
      // 1. Delete existing matches for this tournament
      const { error: dErr } = await supabase.from('matches').delete().eq('tournament', tourn)
      if (dErr) throw new Error('Error al limpiar partidos anteriores: ' + dErr.message)

      const matchesToInsert = []

      if (tourn === 'prequaly') {
        // PreQualy: 48 players draw
        // ROUND 1: 32 matches (for a 64-player draw to accommodate 48 players + byes)
        for (let i = 1; i <= 32; i++) {
          matchesToInsert.push({
            round: 1,
            match_number: i,
            player1_id: null,
            player2_id: null,
            status: 'pending',
            score1: '', score2: '', winner_id: null,
            tournament: 'prequaly',
            scheduled_date: null
          })
        }
        // ROUND 2: 16 matches
        for (let i = 1; i <= 16; i++) {
          matchesToInsert.push({
            round: 2,
            match_number: i,
            player1_id: null,
            player2_id: null,
            status: 'pending',
            score1: '', score2: '', winner_id: null,
            tournament: 'prequaly',
            scheduled_date: null
          })
        }
        // ROUND 3: 8 matches (Octavos)
        for (let i = 1; i <= 8; i++) {
          matchesToInsert.push({
            round: 3,
            match_number: i,
            player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
            tournament: 'prequaly',
            scheduled_date: null
          })
        }
        // ROUND 4: 4 matches (Cuartos)
        for (let i = 1; i <= 4; i++) {
          matchesToInsert.push({
            round: 4,
            match_number: i,
            player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
            tournament: 'prequaly',
            scheduled_date: null
          })
        }
        // ROUND 5: 2 matches (Semis)
        for (let i = 1; i <= 2; i++) {
          matchesToInsert.push({
            round: 5,
            match_number: i,
            player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
            tournament: 'prequaly',
            scheduled_date: null
          })
        }
        // ROUND 6: 1 match (Final)
        matchesToInsert.push({
          round: 6,
          match_number: 1,
          player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
          tournament: 'prequaly',
          scheduled_date: null
        })
      } else if (tourn === 'qualy' || tourn === 'm15_singles') {
        // Qualy or M15 Singles: 32 players draw
        // ROUND 1: 16 matches
        for (let i = 1; i <= 16; i++) {
          matchesToInsert.push({
            round: 1,
            match_number: i,
            player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
            tournament: tourn,
            scheduled_date: null
          })
        }
        // ROUND 2: 8 matches (Octavos)
        for (let i = 1; i <= 8; i++) {
          matchesToInsert.push({
            round: 2,
            match_number: i,
            player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
            tournament: tourn,
            scheduled_date: null
          })
        }
        // ROUND 3: 4 matches (Cuartos)
        for (let i = 1; i <= 4; i++) {
          matchesToInsert.push({
            round: 3,
            match_number: i,
            player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
            tournament: tourn,
            scheduled_date: null
          })
        }
        // ROUND 4: 2 matches (Semis)
        for (let i = 1; i <= 2; i++) {
          matchesToInsert.push({
            round: 4,
            match_number: i,
            player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
            tournament: tourn,
            scheduled_date: null
          })
        }
        // ROUND 5: 1 match (Final)
        matchesToInsert.push({
          round: 5,
          match_number: 1,
          player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
          tournament: tourn,
          scheduled_date: null
        })
      } else if (tourn === 'm15_doubles') {
        // M15 Doubles: 16 pairs draw
        // ROUND 1: 8 matches
        for (let i = 1; i <= 8; i++) {
          matchesToInsert.push({
            round: 1,
            match_number: i,
            player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
            tournament: 'm15_doubles',
            scheduled_date: null
          })
        }
        // ROUND 2: 4 matches (Cuartos)
        for (let i = 1; i <= 4; i++) {
          matchesToInsert.push({
            round: 2,
            match_number: i,
            player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
            tournament: 'm15_doubles',
            scheduled_date: null
          })
        }
        // ROUND 3: 2 matches (Semis)
        for (let i = 1; i <= 2; i++) {
          matchesToInsert.push({
            round: 3,
            match_number: i,
            player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
            tournament: 'm15_doubles',
            scheduled_date: null
          })
        }
        // ROUND 4: 1 match (Final)
        matchesToInsert.push({
          round: 4,
          match_number: 1,
          player1_id: null, player2_id: null, status: 'pending', score1: '', score2: '', winner_id: null,
          tournament: 'm15_doubles',
          scheduled_date: null
        })
      }

      const { error: insErr } = await supabase.from('matches').insert(matchesToInsert)
      if (insErr) throw insErr

      setMsg(`Estructura vacía de ${labels[tourn]} generada correctamente.`)
      fetchMatches()
    } catch (e) {
      setMsg('Error: ' + e.message)
    }
    setLoading(false)
  }

  const getLocalDatetimeLocal = (utcString) => {
    if (!utcString) return '';
    const d = new Date(utcString);
    if (isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  const editMatch = (match) => {
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
      status: match.status === 'live' ? 'scheduled' : match.status, // Remove 'live' default support
      set1_p1: setsP1[0], set1_p2: setsP2[0],
      set2_p1: setsP1[1], set2_p2: setsP2[1],
      set3_p1: setsP1[2], set3_p2: setsP2[2],
      winner_id: match.winner_id || '',
      scheduled_date: getLocalDatetimeLocal(match.scheduled_date),
      court: match.court || ''
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
      scheduled_date: matchForm.scheduled_date ? new Date(matchForm.scheduled_date).toISOString() : null,
      court: matchForm.court || null
    }

    try {
      // 1. Update the match
      const { error: upErr } = await supabase.from('matches').update(updateData).eq('id', editingMatchId)
      if (upErr) throw upErr

      // 2. Advance player if completed and not final round
      const maxR = getMaxRound(match.tournament)
      if (matchForm.status === 'completed' && matchForm.winner_id && match.round < maxR) {
        const nextRound = match.round + 1
        
        // Standard 2:1 merge progression
        const targetMatchNumber = Math.floor((match.match_number - 1) / 2) + 1
        const isPlayer1 = (match.match_number % 2 !== 0)

        // Find the match in the next round
        const nextMatch = matches.find(m => m.tournament === match.tournament && m.round === nextRound && m.match_number === targetMatchNumber)
        if (nextMatch) {
          const advData = isPlayer1 
            ? { player1_id: matchForm.winner_id }
            : { player2_id: matchForm.winner_id }
          
          const { error: advErr } = await supabase.from('matches').update(advData).eq('id', nextMatch.id)
          if (advErr) console.error('Error advancing player:', advErr)
        }
      }

      setMsg('Partido guardado correctamente')
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
      date: (newsForm.date ? newsForm.date.slice(0, 10) : new Date().toISOString().slice(0, 10))
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
      priority: parseInt(sponsorForm.priority) || 0,
      category: sponsorForm.category
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
      priority: s.priority || 0,
      category: s.category || 'colaborador'
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
    setSponsorForm({ name: '', logo_url: '', website: '', description: '', priority: 0, category: 'colaborador' })
    setEditingSponsorId(null)
    setShowSponsorForm(false)
  }

  // --- GALLERY API ---
  const fetchGallery = async () => {
    const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
    if (error) console.error('Error fetching gallery photos:', error)
    else setGallery(data || [])
  }

  const saveGallery = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const data = {
      image_url: galleryForm.image_url,
      caption: galleryForm.caption,
      tournament: galleryForm.tournament
    }

    let error
    if (editingGalleryId) {
      const res = await supabase.from('gallery').update(data).eq('id', editingGalleryId)
      error = res.error
    } else {
      const res = await supabase.from('gallery').insert([data])
      error = res.error
    }

    if (error) {
      setMsg('Error al guardar en la galería: ' + error.message)
    } else {
      setMsg('Foto guardada en galería correctamente')
      resetGalleryForm()
      fetchGallery()
    }
    setLoading(false)
  }

  const editGallery = (photo) => {
    setGalleryForm({
      image_url: photo.image_url,
      caption: photo.caption || '',
      tournament: photo.tournament || 'general'
    })
    setEditingGalleryId(photo.id)
    setShowGalleryForm(true)
  }

  const deleteGallery = async (id) => {
    if (!confirm('¿Eliminar esta foto de la galería?')) return
    setLoading(true)
    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (error) setMsg('Error al eliminar foto de galería: ' + error.message)
    else {
      setMsg('Foto eliminada de galería')
      fetchGallery()
    }
    setLoading(false)
  }

  const resetGalleryForm = () => {
    setGalleryForm({ image_url: '', caption: '', tournament: 'general' })
    setEditingGalleryId(null)
    setShowGalleryForm(false)
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
          <p className="text-gray-400">Administración general de torneos M15</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setActiveTab('players'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition text-xs ${activeTab === 'players' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <Users className="w-4 h-4" /> Jugadores
          </button>

          <button 
            onClick={() => { setActiveTab('cuadro'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition text-xs ${activeTab === 'cuadro' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Cuadro
          </button>
          <button 
            onClick={() => { setActiveTab('gallery'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition text-xs ${activeTab === 'gallery' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <Camera className="w-4 h-4" /> Galería
          </button>
          <button 
            onClick={() => { setActiveTab('news'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition text-xs ${activeTab === 'news' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <Megaphone className="w-4 h-4" /> Noticias
          </button>
          <button 
            onClick={() => { setActiveTab('sponsors'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition text-xs ${activeTab === 'sponsors' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <Star className="w-4 h-4" /> Patrocinadores
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setMsg('') }} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition text-xs ${activeTab === 'settings' ? 'bg-primary text-secondary' : 'bg-gray-dark text-gray-300 hover:text-primary'}`}
          >
            <Settings className="w-4 h-4" /> Configuración
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

      {/* Edit Match Modal (Shared across tabs) */}
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
              {/* Players selection manual */}
              <div className="grid md:grid-cols-2 gap-6 bg-secondary/50 p-4 rounded-lg border border-primary/10">
                <div>
                  <label className="block text-gray-300 mb-1 text-sm font-bold text-primary">Jugador 1 / Pareja 1</label>
                  <select 
                    value={matchForm.player1_id} 
                    onChange={e => setMatchForm({...matchForm, player1_id: e.target.value})} 
                    className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white text-sm"
                  >
                    <option value="">A confirmar</option>
                    {players.filter(p => p.tournament === selectedMatchTournament).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm font-bold text-primary">Jugador 2 / Pareja 2</label>
                  <select 
                    value={matchForm.player2_id} 
                    onChange={e => setMatchForm({...matchForm, player2_id: e.target.value})} 
                    className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white text-sm"
                  >
                    <option value="">A confirmar</option>
                    {players.filter(p => p.tournament === selectedMatchTournament).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
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
                      <option value="pending">No Programado</option>
                      <option value="scheduled">Programado</option>
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

                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Cancha Asignada</label>
                    <select 
                      value={matchForm.court} 
                      onChange={e => setMatchForm({...matchForm, court: e.target.value})} 
                      className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="">No asignada</option>
                      {selectedMatchTournament === 'prequaly' ? (
                        <>
                          <option value="Cancha 1">Cancha 1 (Empalme Central)</option>
                          <option value="Cancha 2">Cancha 2 (Empalme Central)</option>
                        </>
                      ) : (
                        <>
                          <option value="Cancha 1">Cancha 1 (Náutico)</option>
                          <option value="Cancha 2">Cancha 2 (Náutico)</option>
                          <option value="Cancha 3">Cancha 3 (Náutico)</option>
                          <option value="Cancha 4">Cancha 4 (Náutico)</option>
                        </>
                      )}
                    </select>
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

              {/* Winner selection */}
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

      {/* --- PLAYERS TAB --- */}
      {activeTab === 'players' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Jugadores ({players.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => { 
                  // Load saved seeds when opening modal
                  try {
                    const savedStr = settingsForm[`${selectedSeedTournament}_seeds`]
                    if (savedStr) setLocalSeeds(JSON.parse(savedStr))
                    else setLocalSeeds({})
                  } catch (e) {}
                  setShowSeedModal(true) 
                }}
                className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 transition"
              >
                <RefreshCw className="w-5 h-5" /> Armar Cuadro Auto
              </button>
              <button 
                onClick={() => { resetPlayerForm(); setShowPlayerForm(true) }}
                className="flex items-center gap-2 bg-primary text-secondary px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
              >
                <Plus className="w-5 h-5" /> Nuevo Jugador
              </button>
            </div>
          </div>

          {/* AUTO DRAW MODAL */}
          {showSeedModal && (
            <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-gray-dark p-6 rounded-xl border-2 border-primary/30 max-w-2xl w-full relative shadow-2xl my-8">
                <button 
                  onClick={() => setShowSeedModal(false)} 
                  className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                  <RefreshCw className="w-6 h-6" /> Armado Automático de Cuadro
                </h3>
                <p className="text-gray-400 text-sm mb-6">Selecciona el torneo y asigna la pre-clasificación (Seed: 1, 2, 3...) a los mejores jugadores. El resto será sorteado al azar.</p>

                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 font-bold text-sm">Seleccionar Torneo a Sortear</label>
                  <select 
                    value={selectedSeedTournament} 
                    onChange={e => {
                      setSelectedSeedTournament(e.target.value)
                      try {
                        const savedStr = settingsForm[`${e.target.value}_seeds`]
                        if (savedStr) setLocalSeeds(JSON.parse(savedStr))
                        else setLocalSeeds({})
                      } catch (err) {}
                    }} 
                    className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-3 text-white font-bold"
                  >
                    <option value="prequaly">PreQualy (64 Slots)</option>
                    <option value="qualy">Qualy (32 Slots)</option>
                    <option value="m15_singles">M15 Singles (32 Slots)</option>
                    <option value="m15_doubles">M15 Dobles (16 Slots)</option>
                  </select>
                </div>

                <div className="max-h-60 overflow-y-auto bg-secondary/50 rounded-lg border border-primary/20 p-2 mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-primary border-b border-primary/20">
                        <th className="p-2">Jugador</th>
                        <th className="p-2 w-24 text-center">Seed #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.filter(p => p.tournament === selectedSeedTournament).map(p => (
                        <tr key={p.id} className="border-b border-gray-700/50">
                          <td className="p-2 text-white">{p.name} <span className="text-xs text-gray-500">({p.club || 'Sin club'})</span></td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              min="1" max="32"
                              value={localSeeds[p.id] || ''}
                              onChange={e => setLocalSeeds(prev => ({ ...prev, [p.id]: e.target.value }))}
                              className="w-full bg-gray-dark border border-primary/30 rounded px-2 py-1 text-center text-white focus:border-primary"
                              placeholder="-"
                            />
                          </td>
                        </tr>
                      ))}
                      {players.filter(p => p.tournament === selectedSeedTournament).length === 0 && (
                        <tr><td colSpan="2" className="p-4 text-center text-gray-400">No hay jugadores inscriptos en este torneo.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleAutoDraw}
                    disabled={loading || players.filter(p => p.tournament === selectedSeedTournament).length === 0}
                    className="flex-1 bg-primary text-secondary font-black py-4 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> 
                    {loading ? 'Generando...' : '¡GENERAR CUADRO AHORA!'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPlayerForm && (
            <div className="bg-gray-dark p-6 rounded-xl border border-primary/20 mb-8 max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary">{editingPlayerId ? 'Editar Jugador' : 'Nuevo Jugador'}</h3>
                <button onClick={resetPlayerForm} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={savePlayer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Nombre completo *</label>
                    <input required value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Torneo Asociado *</label>
                    <select required value={playerForm.tournament} onChange={e => setPlayerForm({...playerForm, tournament: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white">
                      <option value="prequaly">PreQualy</option>
                      <option value="qualy">Qualy</option>
                      <option value="m15_singles">M15 Singles</option>
                      <option value="m15_doubles">M15 Dobles</option>
                    </select>
                  </div>
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
                
                {/* Photo Selector with Storage Upload option */}
                <div className="bg-secondary/40 p-4 rounded-xl border border-primary/10 space-y-3">
                  <label className="block text-gray-300 text-sm font-bold text-primary">Foto del Jugador</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Subir Archivo directamente</label>
                      <input 
                        type="file" 
                        accept="image/*,.heic,.heif"
                        onChange={e => uploadFile(e, 'photo_url', playerForm, setPlayerForm)}
                        className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-xs text-white file:bg-primary file:text-secondary file:border-0 file:rounded file:px-3 file:py-1 file:font-black file:mr-3 file:cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">O escribe URL de la foto</label>
                      <input 
                        type="text"
                        placeholder="https://..." 
                        value={playerForm.photo_url} 
                        onChange={e => setPlayerForm({...playerForm, photo_url: e.target.value})} 
                        className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-xs text-white" 
                      />
                    </div>
                  </div>
                  {playerForm.photo_url && (
                    <div className="flex items-center gap-3 bg-secondary/80 p-2 rounded-lg border border-primary/5">
                      <img src={playerForm.photo_url} alt="" className="w-12 h-12 rounded-full object-cover border border-primary/25" />
                      <span className="text-xs text-gray-400 truncate max-w-[300px]">{playerForm.photo_url}</span>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={playerForm.paid} onChange={e => setPlayerForm({...playerForm, paid: e.target.checked})} className="w-4 h-4 accent-primary" />
                  <span className="text-gray-300 font-medium">Inscripción pagada</span>
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

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="flex flex-wrap gap-2 bg-secondary/80 p-1.5 rounded-xl border border-primary/20">
              {['all', 'prequaly', 'qualy', 'm15_singles', 'm15_doubles'].map(t => (
                <button 
                  key={t}
                  onClick={() => setPlayerFilter(t)}
                  className={`flex-1 min-w-[90px] text-center py-2 px-3 rounded-lg font-black transition text-xs uppercase ${playerFilter === t ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
                >
                  {t === 'all' ? 'Todos' : t.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            {/* Buscador y Exportar */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Buscar por nombre o club..." 
                value={playerSearch}
                onChange={e => setPlayerSearch(e.target.value)}
                className="flex-1 md:w-64 bg-gray-dark border border-primary/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary text-sm" 
              />
              <button 
                onClick={exportPlayersCSV}
                className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm"
              >
                <Download className="w-4 h-4" /> Exportar CSV
              </button>
            </div>
          </div>

          <div className="bg-gray-dark rounded-xl border border-primary/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-primary/20 text-left">
                  <tr>
                    <th className="px-4 py-3 text-primary font-bold">Foto</th>
                    <th className="px-4 py-3 text-primary font-bold">Nombre</th>
                    <th className="px-4 py-3 text-primary font-bold">Torneo</th>
                    <th className="px-4 py-3 text-primary font-bold">Edad</th>
                    <th className="px-4 py-3 text-primary font-bold">Mano</th>
                    <th className="px-4 py-3 text-primary font-bold">Club</th>
                    <th className="px-4 py-3 text-primary font-bold">Pago</th>
                    <th className="px-4 py-3 text-center text-primary font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {players.filter(p => {
                    const matchesFilter = playerFilter === 'all' || p.tournament === playerFilter
                    const matchesSearch = p.name.toLowerCase().includes(playerSearch.toLowerCase()) || (p.club && p.club.toLowerCase().includes(playerSearch.toLowerCase()))
                    return matchesFilter && matchesSearch
                  }).map((player, idx) => (
                    <tr key={player.id} className={`border-b border-gray-700 ${idx % 2 === 0 ? 'bg-gray-dark' : 'bg-gray-800/50'}`}>
                      <td className="px-4 py-2">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                          {player.photo_url ? <img src={player.photo_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-primary" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-white">{player.name}</td>
                      <td className="px-4 py-3 font-semibold text-primary uppercase text-xs">{player.tournament === 'prequaly' ? 'PreQualy' : player.tournament === 'qualy' ? 'Qualy' : player.tournament === 'm15_singles' ? 'M15 Singles' : 'M15 Dobles'}</td>
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
                      <td colSpan="8" className="p-8 text-center text-gray-400">No hay jugadores cargados en la base de datos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* --- CUADRO TAB --- */}
      {activeTab === 'cuadro' && (
        <div className="bg-gray-dark p-6 rounded-2xl border border-primary/10 overflow-hidden relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-primary/10 pb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-primary" />
              Vista de Cuadro
            </h2>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button 
                onClick={() => generateBracketStructure('prequaly')}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-black hover:bg-red-800 transition"
              >
                <RefreshCw className="w-4 h-4" /> Generar PreQualy (48)
              </button>
              <button 
                onClick={() => generateBracketStructure('qualy')}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-black hover:bg-red-800 transition"
              >
                <RefreshCw className="w-4 h-4" /> Generar Qualy (32)
              </button>
              <button 
                onClick={() => generateBracketStructure('m15_singles')}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-black hover:bg-red-800 transition"
              >
                <RefreshCw className="w-4 h-4" /> Generar M15 Singles (32)
              </button>
              <button 
                onClick={() => generateBracketStructure('m15_doubles')}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-black hover:bg-red-800 transition"
              >
                <RefreshCw className="w-4 h-4" /> Generar M15 Dobles (16)
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6 bg-secondary/80 p-1.5 rounded-xl border border-primary/20">
            {['prequaly', 'qualy', 'm15_singles', 'm15_doubles'].map(t => (
              <button 
                key={t}
                onClick={() => setSelectedMatchTournament(t)}
                className={`flex-1 text-center py-2.5 rounded-lg font-black transition text-xs uppercase ${selectedMatchTournament === t ? 'bg-primary text-secondary' : 'text-gray-400 hover:text-primary'}`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          <Bracket 
            tournament={selectedMatchTournament} 
            matches={matches.filter(m => m.tournament === selectedMatchTournament)} 
            onMatchClick={editMatch} 
          />
        </div>
      )}


      {/* --- GALLERY TAB --- */}
      {activeTab === 'gallery' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Camera className="w-6 h-6 text-primary" />
              Gestión de Galería de Fotos ({gallery.length})
            </h2>
            <button 
              onClick={() => { resetGalleryForm(); setShowGalleryForm(true) }}
              className="flex items-center gap-2 bg-primary text-secondary px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
            >
              <Plus className="w-5 h-5" /> Subir Nueva Foto
            </button>
          </div>

          {showGalleryForm && (
            <div className="bg-gray-dark p-6 rounded-xl border border-primary/20 mb-8 max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary">{editingGalleryId ? 'Editar Foto de Galería' : 'Nueva Foto de Galería'}</h3>
                <button onClick={resetGalleryForm} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={saveGallery} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Torneo Asociado</label>
                    <select required value={galleryForm.tournament} onChange={e => setGalleryForm({...galleryForm, tournament: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white">
                      <option value="general">General</option>
                      <option value="prequaly">PreQualy</option>
                      <option value="qualy">Qualy</option>
                      <option value="m15">M15 Villa Constitución</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Leyenda / Pie de foto</label>
                    <input placeholder="Ej: Entrega de premios..." value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                  </div>
                </div>

                {/* Direct Image Upload to Storage */}
                <div className="bg-secondary/40 p-4 rounded-xl border border-primary/10 space-y-3">
                  <label className="block text-gray-300 text-sm font-bold text-primary">Imagen de la Galería</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Subir Archivo directamente</label>
                      <input 
                        type="file" 
                        accept="image/*,video/mp4,video/avi,.heic,.heif"
                        onChange={e => uploadFile(e, 'image_url', galleryForm, setGalleryForm)}
                        className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-xs text-white file:bg-primary file:text-secondary file:border-0 file:rounded file:px-3 file:py-1 file:font-black file:mr-3 file:cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">O escribe URL de la foto</label>
                      <input 
                        type="text"
                        placeholder="https://..." 
                        value={galleryForm.image_url} 
                        onChange={e => setGalleryForm({...galleryForm, image_url: e.target.value})} 
                        className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-xs text-white" 
                      />
                    </div>
                  </div>
                  {galleryForm.image_url && (
                    <div className="mt-2 bg-secondary/80 p-2 rounded-lg border border-primary/5 flex flex-col items-center">
                      {galleryForm.image_url.match(/\.(mp4|avi)$/i) ? (
                        <video src={galleryForm.image_url} controls className="max-h-40 rounded border border-primary/25 object-contain" />
                      ) : (
                        <img src={galleryForm.image_url} alt="" className="max-h-40 rounded border border-primary/25 object-contain" />
                      )}
                      <span className="text-xs text-gray-400 truncate max-w-full mt-2">{galleryForm.image_url}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button disabled={loading || !galleryForm.image_url} type="submit" className="flex-1 bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    <Save className="w-5 h-5" /> Guardar en Galería
                  </button>
                  <button type="button" onClick={resetGalleryForm} className="px-6 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition">Cancelar</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gallery.map(photo => (
              <div key={photo.id} className="bg-gray-dark rounded-xl border border-primary/20 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-44 bg-secondary flex items-center justify-center overflow-hidden">
                    {photo.image_url ? (
                      <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-10 h-10 text-primary/40" />
                    )}
                    <span className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-primary uppercase font-bold border border-primary/20">
                      {photo.tournament === 'general' ? 'General' : photo.tournament === 'prequaly' ? 'PreQualy' : photo.tournament === 'qualy' ? 'Qualy' : 'M15 VC'}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-white text-sm font-semibold mb-1 line-clamp-2">{photo.caption || 'Sin descripción'}</p>
                    <span className="text-xs text-gray-500 font-mono">{photo.created_at ? new Date(photo.created_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>
                <div className="p-4 border-t border-primary/10 flex justify-end gap-2 bg-secondary/15">
                  <button onClick={() => editGallery(photo)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteGallery(photo.id)} className="p-2 bg-red-600 hover:bg-red-500 rounded text-white transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {gallery.length === 0 && (
              <div className="col-span-3 p-12 text-center text-gray-400 bg-gray-dark rounded-xl border border-primary/10">
                La galería está vacía. Haz clic en "Subir Nueva Foto" para comenzar.
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
                  
                  {/* News image storage upload support */}
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Imagen de Noticia</label>
                    <input 
                      type="file" 
                      accept="image/*,.heic,.heif"
                      onChange={e => uploadFile(e, 'image', newsForm, setNewsForm)}
                      className="w-full bg-secondary border border-primary/20 rounded px-2.5 py-1 text-xs text-white file:bg-primary file:text-secondary file:border-0 file:rounded file:px-2 file:py-0.5 file:font-black file:mr-2 file:cursor-pointer"
                    />
                    <input placeholder="https://..." value={newsForm.image} onChange={e => setNewsForm({...newsForm, image: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white text-xs mt-2" />
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
                    <span className="text-xs text-primary font-bold block mb-1">{n.date ? n.date.slice(0, 10) : ''}</span>
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm font-bold text-primary">Nombre / Empresa</label>
                    <input required value={sponsorForm.name} onChange={e => setSponsorForm({...sponsorForm, name: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm font-bold text-primary">Categoría</label>
                      <select required value={sponsorForm.category} onChange={e => setSponsorForm({...sponsorForm, category: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white">
                        <option value="principal">Title Sponsor (Principal)</option>
                        <option value="oficial">Sponsor Oficial</option>
                        <option value="colaborador">Colaborador</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm font-bold text-primary">Prioridad Visual (0-99)</label>
                      <input type="number" min="0" value={sponsorForm.priority} onChange={e => setSponsorForm({...sponsorForm, priority: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white" />
                    </div>
                  </div>
                </div>
                  
                  {/* Sponsor Storage Upload support */}
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Logo del Sponsor</label>
                    <input 
                      type="file" 
                      accept="image/*,.heic,.heif"
                      onChange={e => uploadFile(e, 'logo_url', sponsorForm, setSponsorForm)}
                      className="w-full bg-secondary border border-primary/20 rounded px-2.5 py-1 text-xs text-white file:bg-primary file:text-secondary file:border-0 file:rounded file:px-2 file:py-0.5 file:font-black file:mr-2 file:cursor-pointer"
                    />
                    <input placeholder="https://..." value={sponsorForm.logo_url} onChange={e => setSponsorForm({...sponsorForm, logo_url: e.target.value})} className="w-full bg-secondary border border-primary/30 rounded-lg px-4 py-2 text-white text-xs mt-2" />
                  </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Sitio Web o Instagram URL</label>
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
                  <span className="text-xs text-primary font-mono block mb-2">Categoría: {s.category || 'colaborador'} | Prioridad: {s.priority}</span>
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
            <p className="text-gray-400 text-sm mt-1">Configura todos los textos e imágenes de la página principal e información.</p>
          </div>

          <form onSubmit={saveSettings} className="space-y-8 bg-gray-dark p-6 rounded-xl border border-primary/20">
            
            {/* APARIENCIA Y COLORES */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-2 flex justify-between items-center">
                Apariencia y Colores
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Color Primario (Acentos)</label>
                  <div className="flex gap-2">
                    <input type="color" value={settingsForm.theme_primary} onChange={e => setSettingsForm({...settingsForm, theme_primary: e.target.value})} className="h-10 w-16 bg-secondary border border-primary/20 rounded cursor-pointer" />
                    <input type="text" value={settingsForm.theme_primary} onChange={e => setSettingsForm({...settingsForm, theme_primary: e.target.value})} className="flex-1 bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Fondo Principal</label>
                  <div className="flex gap-2">
                    <input type="color" value={settingsForm.theme_secondary} onChange={e => setSettingsForm({...settingsForm, theme_secondary: e.target.value})} className="h-10 w-16 bg-secondary border border-primary/20 rounded cursor-pointer" />
                    <input type="text" value={settingsForm.theme_secondary} onChange={e => setSettingsForm({...settingsForm, theme_secondary: e.target.value})} className="flex-1 bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Fondo de Tarjetas</label>
                  <div className="flex gap-2">
                    <input type="color" value={settingsForm.theme_gray_dark} onChange={e => setSettingsForm({...settingsForm, theme_gray_dark: e.target.value})} className="h-10 w-16 bg-secondary border border-primary/20 rounded cursor-pointer" />
                    <input type="text" value={settingsForm.theme_gray_dark} onChange={e => setSettingsForm({...settingsForm, theme_gray_dark: e.target.value})} className="flex-1 bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Color Arcilla (Decorativo)</label>
                  <div className="flex gap-2">
                    <input type="color" value={settingsForm.theme_clay} onChange={e => setSettingsForm({...settingsForm, theme_clay: e.target.value})} className="h-10 w-16 bg-secondary border border-primary/20 rounded cursor-pointer" />
                    <input type="text" value={settingsForm.theme_clay} onChange={e => setSettingsForm({...settingsForm, theme_clay: e.target.value})} className="flex-1 bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Color de Texto Principal</label>
                  <div className="flex gap-2">
                    <input type="color" value={settingsForm.theme_text} onChange={e => setSettingsForm({...settingsForm, theme_text: e.target.value})} className="h-10 w-16 bg-secondary border border-primary/20 rounded cursor-pointer" />
                    <input type="text" value={settingsForm.theme_text} onChange={e => setSettingsForm({...settingsForm, theme_text: e.target.value})} className="flex-1 bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* INICIO SECTION */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-2 flex justify-between items-center">
                A. Portada (Inicio)
              </h3>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Imagen de Fondo (URL o subir archivo)</label>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    accept="image/*,.heic,.heif"
                    onChange={e => uploadFile(e, 'home_hero_bg_image', settingsForm, setSettingsForm)}
                    className="w-1/3 bg-secondary border border-primary/20 rounded px-2.5 py-1 text-xs text-white file:bg-primary file:text-secondary file:border-0 file:rounded file:px-2 file:py-0.5 file:font-black file:cursor-pointer"
                  />
                  <input placeholder="/tennis_hero_bg.png" value={settingsForm.home_hero_bg_image} onChange={e => setSettingsForm({...settingsForm, home_hero_bg_image: e.target.value})} className="flex-1 bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Badge (Ej: ITF World Tennis Tour)</label>
                  <input placeholder="ITF World Tennis Tour" value={settingsForm.home_badge_text} onChange={e => setSettingsForm({...settingsForm, home_badge_text: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Texto Barra de Navegación</label>
                  <input placeholder="M15" value={settingsForm.nav_brand_text} onChange={e => setSettingsForm({...settingsForm, nav_brand_text: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Título Principal</label>
                  <input placeholder="TORNEO M15" value={settingsForm.home_hero_title} onChange={e => setSettingsForm({...settingsForm, home_hero_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Subtítulo (Highlight)</label>
                  <input placeholder="VILLA CONSTITUCIÓN" value={settingsForm.home_hero_subtitle} onChange={e => setSettingsForm({...settingsForm, home_hero_subtitle: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Descripción de Portada</label>
                <input placeholder="El evento de tenis profesional más importante de la región." value={settingsForm.home_hero_desc} onChange={e => setSettingsForm({...settingsForm, home_hero_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Dato Rápido 1</label>
                  <input placeholder="Semana del 13 de Julio" value={settingsForm.home_stats_1} onChange={e => setSettingsForm({...settingsForm, home_stats_1: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Dato Rápido 2</label>
                  <input placeholder="Club Náutico Villa Const..." value={settingsForm.home_stats_2} onChange={e => setSettingsForm({...settingsForm, home_stats_2: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Dato Rápido 3</label>
                  <input placeholder="Singles & Dobles" value={settingsForm.home_stats_3} onChange={e => setSettingsForm({...settingsForm, home_stats_3: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
              </div>
            </div>

            {/* FASES SECTION */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-2">B. Fases del Torneo (Inicio)</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Título de Sección Fases</label>
                  <input placeholder="EL CAMINO AL M15" value={settingsForm.home_fases_title} onChange={e => setSettingsForm({...settingsForm, home_fases_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Subtítulo de Sección Fases</label>
                  <input placeholder="Conoce las fases previas..." value={settingsForm.home_fases_desc} onChange={e => setSettingsForm({...settingsForm, home_fases_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 bg-secondary/30 p-4 rounded-xl border border-primary/10">
                {/* FASE 1 */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-sm">Fase 1</h4>
                  <input placeholder="Fase 1: PreQualy" value={settingsForm.fase1_name} onChange={e => setSettingsForm({...settingsForm, fase1_name: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <input placeholder="15 de Junio" value={settingsForm.fase1_date} onChange={e => setSettingsForm({...settingsForm, fase1_date: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <input placeholder="Pre-Clasificación" value={settingsForm.fase1_title} onChange={e => setSettingsForm({...settingsForm, fase1_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <input placeholder="Sede: Club Empalme Central" value={settingsForm.fase1_venue} onChange={e => setSettingsForm({...settingsForm, fase1_venue: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <textarea rows="2" placeholder="Descripción corta..." value={settingsForm.fase1_desc} onChange={e => setSettingsForm({...settingsForm, fase1_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white"></textarea>
                </div>
                {/* FASE 2 */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-sm">Fase 2</h4>
                  <input placeholder="Fase 2: Qualy" value={settingsForm.fase2_name} onChange={e => setSettingsForm({...settingsForm, fase2_name: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <input placeholder="12 y 13 de Julio" value={settingsForm.fase2_date} onChange={e => setSettingsForm({...settingsForm, fase2_date: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <input placeholder="Clasificación Principal" value={settingsForm.fase2_title} onChange={e => setSettingsForm({...settingsForm, fase2_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <input placeholder="Sede: Club Náutico" value={settingsForm.fase2_venue} onChange={e => setSettingsForm({...settingsForm, fase2_venue: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <textarea rows="2" placeholder="Descripción corta..." value={settingsForm.fase2_desc} onChange={e => setSettingsForm({...settingsForm, fase2_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white"></textarea>
                </div>
                {/* FASE 3 */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-sm">Fase 3</h4>
                  <input placeholder="Fase 3: Torneo Principal" value={settingsForm.fase3_name} onChange={e => setSettingsForm({...settingsForm, fase3_name: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <input placeholder="15 al 21 de Julio" value={settingsForm.fase3_date} onChange={e => setSettingsForm({...settingsForm, fase3_date: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <input placeholder="Main Draw M15" value={settingsForm.fase3_title} onChange={e => setSettingsForm({...settingsForm, fase3_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <input placeholder="Sede: Club Náutico" value={settingsForm.fase3_venue} onChange={e => setSettingsForm({...settingsForm, fase3_venue: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white" />
                  <textarea rows="2" placeholder="Descripción corta..." value={settingsForm.fase3_desc} onChange={e => setSettingsForm({...settingsForm, fase3_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1 text-xs text-white"></textarea>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Título Sección Galería</label>
                  <input placeholder="Momentos Destacados" value={settingsForm.home_gallery_title} onChange={e => setSettingsForm({...settingsForm, home_gallery_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                
                <div className="bg-secondary/40 p-4 rounded-lg border border-primary/10 col-span-2 space-y-4">
                  <h4 className="text-lg font-bold text-primary mb-2">Ajustes Adicionales</h4>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Velocidad Carrusel Patrocinadores (Segundos)</label>
                    <p className="text-xs text-gray-500 mb-2">Un número menor significa mayor velocidad. Recomendado: 40.</p>
                    <input type="number" min="5" placeholder="40" value={settingsForm.carousel_speed} onChange={e => setSettingsForm({...settingsForm, carousel_speed: e.target.value})} className="w-full bg-gray-dark border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Velocidad Carrusel Partidos (Segundos)</label>
                    <p className="text-xs text-gray-500 mb-2">Un número menor significa mayor velocidad. Recomendado: 30.</p>
                    <input type="number" min="5" placeholder="30" value={settingsForm.matches_carousel_speed} onChange={e => setSettingsForm({...settingsForm, matches_carousel_speed: e.target.value})} className="w-full bg-gray-dark border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                  </div>
                </div>

                <h4 className="text-lg font-bold text-primary mb-2 mt-6 border-t border-primary/10 pt-4">Integraciones Externas</h4>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Código Widget Instagram (Iframe o Script)</label>
                  <p className="text-xs text-gray-500 mb-2">Pega aquí el código HTML (iframe/script) que te genere tu proveedor (ej. Elfsight, SnapWidget). Si hay código aquí, la página de Galería mostrará el feed de Instagram en lugar de las fotos subidas localmente.</p>
                  <textarea placeholder="<script src='...'></script><div class='elfsight-app-xxx'></div>" value={settingsForm.instagram_widget_code} onChange={e => setSettingsForm({...settingsForm, instagram_widget_code: e.target.value})} className="w-full bg-gray-dark border border-primary/20 rounded px-4 py-2 text-sm text-white font-mono h-32" />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Título Sección Noticias</label>
                  <input placeholder="Noticias Recientes" value={settingsForm.home_news_title} onChange={e => setSettingsForm({...settingsForm, home_news_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Título Sección Patrocinadores</label>
                  <input placeholder="Todos los Patrocinadores" value={settingsForm.home_sponsors_title} onChange={e => setSettingsForm({...settingsForm, home_sponsors_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
              </div>
            </div>

            {/* INFORMACION SECTION */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-2">C. Textos Página Información</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Título de Página Información</label>
                  <input placeholder="INFORMACIÓN DEL TORNEO" value={settingsForm.reglas_main_title} onChange={e => setSettingsForm({...settingsForm, reglas_main_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Subtítulo de Página Información</label>
                  <input placeholder="Detalles esenciales y logística..." value={settingsForm.reglas_main_desc} onChange={e => setSettingsForm({...settingsForm, reglas_main_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Título Sección 1</label>
                  <input placeholder="1. Información General" value={settingsForm.reglas_sec1_title} onChange={e => setSettingsForm({...settingsForm, reglas_sec1_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Título Sección 2</label>
                  <input placeholder="2. Sedes del Torneo" value={settingsForm.reglas_sec2_title} onChange={e => setSettingsForm({...settingsForm, reglas_sec2_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Título Sección 3</label>
                  <input placeholder="3. Contactos y Organización" value={settingsForm.reglas_sec3_title} onChange={e => setSettingsForm({...settingsForm, reglas_sec3_title: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-4 py-2 text-sm text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Descripción General (admite saltos de línea)</label>
                <textarea rows="8" value={settingsForm.informacion_torneo} onChange={e => setSettingsForm({...settingsForm, informacion_torneo: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded p-3 text-sm text-white" placeholder="Escribe el reglamento, sistema de juego y premios aquí..."></textarea>
              </div>
            </div>

            {/* Sede Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-2">D. Detalles de las Sedes del Torneo</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Sede Principal */}
                <div className="bg-secondary/30 p-4 rounded-xl border border-primary/10 space-y-3">
                  <h4 className="font-bold text-white mb-2">Sede Principal (M15 & Qualy)</h4>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre del Club</label>
                    <input placeholder="Club Náutico Villa Constitución" value={settingsForm.sede_principal_nombre} onChange={e => setSettingsForm({...settingsForm, sede_principal_nombre: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Descripción corta</label>
                    <textarea rows="2" placeholder="Sede oficial del torneo internacional M15..." value={settingsForm.sede_principal_desc} onChange={e => setSettingsForm({...settingsForm, sede_principal_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Dirección exacta</label>
                    <input placeholder="San Luis & Ministro Seguí..." value={settingsForm.sede_principal_direccion} onChange={e => setSettingsForm({...settingsForm, sede_principal_direccion: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Link de Google Maps</label>
                    <input placeholder="https://maps.google.com/..." value={settingsForm.sede_principal_mapa} onChange={e => setSettingsForm({...settingsForm, sede_principal_mapa: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white" />
                  </div>
                </div>

                {/* Sede Pre-Qualy */}
                <div className="bg-secondary/30 p-4 rounded-xl border border-primary/10 space-y-3">
                  <h4 className="font-bold text-white mb-2">Sede Secundaria (Pre-Qualy)</h4>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre del Club</label>
                    <input placeholder="Club Empalme Central" value={settingsForm.sede_prequaly_nombre} onChange={e => setSettingsForm({...settingsForm, sede_prequaly_nombre: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Descripción corta</label>
                    <textarea rows="2" placeholder="Sede exclusiva para la fase de Pre-Qualy..." value={settingsForm.sede_prequaly_desc} onChange={e => setSettingsForm({...settingsForm, sede_prequaly_desc: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Dirección exacta</label>
                    <input placeholder="Juan José Paso 49..." value={settingsForm.sede_prequaly_direccion} onChange={e => setSettingsForm({...settingsForm, sede_prequaly_direccion: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Link de Google Maps</label>
                    <input placeholder="https://maps.google.com/..." value={settingsForm.sede_prequaly_mapa} onChange={e => setSettingsForm({...settingsForm, sede_prequaly_mapa: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-3 py-1.5 text-sm text-white" />
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm text-gray-300 mb-1">Información Adicional de Logística (Opcional)</label>
                <textarea rows="4" value={settingsForm.logistica_sede} onChange={e => setSettingsForm({...settingsForm, logistica_sede: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded p-3 text-sm text-white" placeholder="Ej: Hay servicio de encordado, viandas, etc."></textarea>
              </div>
            </div>

            {/* Contactos Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-2">E. Organización y Contactos</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-secondary/30 p-4 rounded-xl border border-primary/10 space-y-3">
                  <h4 className="font-bold text-white text-sm">Contacto 1</h4>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                    <input placeholder="Esteban Spinetta" value={settingsForm.contacto_nombre_1} onChange={e => setSettingsForm({...settingsForm, contacto_nombre_1: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Rol</label>
                    <input placeholder="Director de Torneo" value={settingsForm.contacto_rol_1} onChange={e => setSettingsForm({...settingsForm, contacto_rol_1: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
                    <input value={settingsForm.contacto_esteban} onChange={e => setSettingsForm({...settingsForm, contacto_esteban: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-sm text-white" />
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-xl border border-primary/10 space-y-3">
                  <h4 className="font-bold text-white text-sm">Contacto 2</h4>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                    <input placeholder="Lucas Mazzei" value={settingsForm.contacto_nombre_2} onChange={e => setSettingsForm({...settingsForm, contacto_nombre_2: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Rol</label>
                    <input placeholder="Director de Torneo" value={settingsForm.contacto_rol_2} onChange={e => setSettingsForm({...settingsForm, contacto_rol_2: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
                    <input value={settingsForm.contacto_lucas} onChange={e => setSettingsForm({...settingsForm, contacto_lucas: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-sm text-white" />
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-xl border border-primary/10 space-y-3">
                  <h4 className="font-bold text-white text-sm">Contacto 3</h4>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                    <input placeholder="Omar Descarrega" value={settingsForm.contacto_nombre_3} onChange={e => setSettingsForm({...settingsForm, contacto_nombre_3: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Rol</label>
                    <input placeholder="Árbitro General (Referee)" value={settingsForm.contacto_rol_3} onChange={e => setSettingsForm({...settingsForm, contacto_rol_3: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Descripción extra / Teléfono</label>
                    <input value={settingsForm.contacto_omar} onChange={e => setSettingsForm({...settingsForm, contacto_omar: e.target.value})} className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-sm text-white" />
                  </div>
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