const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wrpdwbrlsygpadnytpkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycGR3YnJsc3lncGFkbnl0cGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Mjg4OTEsImV4cCI6MjA5NTQwNDg5MX0.PcofYb920xicZxYo9evRUB0Fo0UrC84TovjYAfCeI18';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase Connection...');
  
  // 1. Check players table
  const { data: players, error: pError } = await supabase.from('players').select('*').limit(5);
  if (pError) {
    console.error('Error fetching players:', pError);
  } else {
    console.log(`Players table exists! Found ${players.length} players. Sample:`, players);
  }

  // 2. Check matches table
  const { data: matches, error: mError } = await supabase.from('matches').select('*').limit(5);
  if (mError) {
    console.error('Error fetching matches:', mError);
  } else {
    console.log(`Matches table exists! Found ${matches.length} matches. Sample:`, matches);
  }

  // 3. Check sponsors table
  const { data: sponsors, error: sError } = await supabase.from('sponsors').select('*').limit(5);
  if (sError) {
    console.error('Error fetching sponsors:', sError);
  } else {
    console.log(`Sponsors table exists! Found ${sponsors.length} sponsors. Sample:`, sponsors);
  }

  // 4. Check news table
  const { data: news, error: nError } = await supabase.from('news').select('*').limit(5);
  if (nError) {
    console.error('Error fetching news:', nError);
  } else {
    console.log(`News table exists! Found ${news.length} news. Sample:`, news);
  }
}

test();
