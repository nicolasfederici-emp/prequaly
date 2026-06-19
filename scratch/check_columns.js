const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wrpdwbrlsygpadnytpkq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycGR3YnJsc3lncGFkbnl0cGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Mjg4OTEsImV4cCI6MjA5NTQwNDg5MX0.PcofYb920xicZxYo9evRUB0Fo0UrC84TovjYAfCeI18'
);

async function check() {
  const { data, error } = await supabase.from('matches').select('*').limit(1);
  if (error) {
    console.error('Error fetching matches:', error);
  } else if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
    if (!Object.keys(data[0]).includes('court')) {
        console.log("MISSING 'court' COLUMN");
    } else {
        console.log("'court' COLUMN EXISTS");
    }
  } else {
    console.log("No matches found to infer columns.");
  }
}
check();
