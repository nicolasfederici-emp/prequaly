const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wrpdwbrlsygpadnytpkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycGR3YnJsc3lncGFkbnl0cGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Mjg4OTEsImV4cCI6MjA5NTQwNDg5MX0.PcofYb920xicZxYo9evRUB0Fo0UrC84TovjYAfCeI18';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  // We can select a single row (even if empty) and inspect the returned keys
  console.log('Inspecting columns...');
  
  const { data: pData, error: pError } = await supabase.from('players').select('*').limit(1);
  console.log('players columns:', pData && pData.length > 0 ? Object.keys(pData[0]) : 'no records');

  // Let's try to insert a dummy record with all fields to see if they are valid
  const dummyPlayer = {
    name: 'Test Player',
    age: 20,
    hand: 'right',
    club: 'Test Club',
    paid: false
  };

  const { data: insertedPlayer, error: insError } = await supabase.from('players').insert([dummyPlayer]).select();
  if (insError) {
    console.error('Insert player error:', insError);
    return;
  }
  
  const playerId = insertedPlayer[0].id;
  console.log('Inserted test player:', playerId);
  console.log('Player record columns:', Object.keys(insertedPlayer[0]));

  // Now inspect matches by inserting a test match
  const dummyMatch = {
    round: 1,
    match_number: 1,
    player1_id: playerId,
    player2_id: null,
    status: 'scheduled',
    score1: '0',
    score2: '0',
    winner_id: null,
    scheduled_date: new Date().toISOString()
  };

  const { data: insertedMatch, error: mError } = await supabase.from('matches').insert([dummyMatch]).select();
  if (mError) {
    console.log('Match insert error (could be because columns differ):', mError.message);
  } else {
    console.log('Inserted test match successfully!');
    console.log('Match columns:', Object.keys(insertedMatch[0]));
    // Delete the test match
    await supabase.from('matches').delete().eq('id', insertedMatch[0].id);
  }

  // Delete the test player
  await supabase.from('players').delete().eq('id', playerId);

  // Check sponsors columns by inserting dummy
  const dummySponsor = {
    name: 'Test Sponsor',
    logo_url: 'http://test.com/logo.png',
    description: 'Test Description',
    website: 'http://test.com',
    priority: 1
  };
  const { data: insertedSponsor, error: sError } = await supabase.from('sponsors').insert([dummySponsor]).select();
  if (sError) {
    console.log('Sponsor insert error:', sError.message);
  } else {
    console.log('Sponsor columns:', Object.keys(insertedSponsor[0]));
    await supabase.from('sponsors').delete().eq('id', insertedSponsor[0].id);
  }

  // Check news columns
  const dummyNews = {
    title: 'Test Title',
    image: 'http://test.com/image.png',
    content: 'Test Content'
  };
  const { data: insertedNews, error: nError } = await supabase.from('news').insert([dummyNews]).select();
  if (nError) {
    console.log('News insert error:', nError.message);
  } else {
    console.log('News columns:', Object.keys(insertedNews[0]));
    await supabase.from('news').delete().eq('id', insertedNews[0].id);
  }
}

test();
