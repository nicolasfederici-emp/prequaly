const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wrpdwbrlsygpadnytpkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycGR3YnJsc3lncGFkbnl0cGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Mjg4OTEsImV4cCI6MjA5NTQwNDg5MX0.PcofYb920xicZxYo9evRUB0Fo0UrC84TovjYAfCeI18';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing generateBracket logic...');

  // 1. Fetch players
  const { data: players, error: pError } = await supabase.from('players').select('*').order('name');
  if (pError) {
    console.error('Error fetching players:', pError);
    return;
  }
  console.log(`Fetched ${players.length} players.`);

  // 2. Clean previous matches
  console.log('Cleaning matches...');
  const { error: dErr } = await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (dErr) {
    console.error('Error cleaning matches:', dErr);
    return;
  }
  console.log('Cleaned matches.');

  // 3. Pair players
  const activePlayers = [...players];
  if (activePlayers.length < 48) {
    const diff = 48 - activePlayers.length;
    for (let i = 1; i <= diff; i++) {
      activePlayers.push({ id: null, name: `BYE / Vacante ${i}` });
    }
  }

  const seeds = activePlayers.slice(0, 16);
  const r1Players = activePlayers.slice(16, 48);

  const matchesToInsert = [];

  // ROUND 1
  for (let i = 1; i <= 16; i++) {
    const p1 = r1Players[(i - 1) * 2];
    const p2 = r1Players[(i - 1) * 2 + 1];
    matchesToInsert.push({
      round: 1,
      match_number: i,
      player1_id: p1.id,
      player2_id: p2.id,
      status: (p1.id === null && p2.id === null) ? 'completed' : 'scheduled',
      score1: '',
      score2: '',
      winner_id: null,
      scheduled_date: new Date(2026, 5, 16, 10 + (i % 4), 0).toISOString()
    });
  }

  // ROUND 2
  for (let i = 1; i <= 16; i++) {
    const seed = seeds[i - 1];
    matchesToInsert.push({
      round: 2,
      match_number: i,
      player1_id: seed.id,
      player2_id: null,
      status: 'scheduled',
      score1: '',
      score2: '',
      winner_id: null,
      scheduled_date: new Date(2026, 5, 17, 10 + (i % 4), 0).toISOString()
    });
  }

  // ROUND 3
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
      scheduled_date: new Date(2026, 5, 18, 12 + (i % 3), 0).toISOString()
    });
  }

  // ROUND 4
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
      scheduled_date: new Date(2026, 5, 19, 14 + (i % 2), 0).toISOString()
    });
  }

  // ROUND 5
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
      scheduled_date: new Date(2026, 5, 20, 15, 0).toISOString()
    });
  }

  // ROUND 6
  matchesToInsert.push({
    round: 6,
    match_number: 1,
    player1_id: null,
    player2_id: null,
    status: 'scheduled',
    score1: '',
    score2: '',
    winner_id: null,
    scheduled_date: new Date(2026, 5, 21, 16, 0).toISOString()
  });

  console.log(`Inserting ${matchesToInsert.length} matches...`);
  const { error: insErr } = await supabase.from('matches').insert(matchesToInsert);
  if (insErr) {
    console.error('Error inserting matches:', insErr);
  } else {
    console.log('Matches inserted successfully!');
  }
}

test();
