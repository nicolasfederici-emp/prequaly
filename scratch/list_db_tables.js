const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wrpdwbrlsygpadnytpkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycGR3YnJsc3lncGFkbnl0cGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Mjg4OTEsImV4cCI6MjA5NTQwNDg5MX0.PcofYb920xicZxYo9evRUB0Fo0UrC84TovjYAfCeI18';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing what tables exist on wrpdwbrlsygpadnytpkq...');

  // 1. Query profiles
  const { data: profiles, error: prError } = await supabase.from('profiles').select('*').limit(5);
  if (prError) {
    console.log('profiles table does NOT exist or RLS blocked it:', prError.message);
  } else {
    console.log('profiles table EXISTS! Count:', profiles.length, 'Sample:', profiles);
  }

  // 2. Query players
  const { data: players, error: plError } = await supabase.from('players').select('*').limit(5);
  if (plError) {
    console.log('players table does NOT exist or RLS blocked it:', plError.message);
  } else {
    console.log('players table EXISTS! Count:', players.length, 'Sample:', players);
  }

  // 3. Query balances
  const { data: balances, error: bError } = await supabase.from('balances').select('*').limit(5);
  if (bError) {
    console.log('balances table does NOT exist or RLS blocked it:', bError.message);
  } else {
    console.log('balances table EXISTS!');
  }
}

test();
