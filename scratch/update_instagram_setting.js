const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSetting() {
  const code = `<!-- Elfsight Instagram Feed | Untitled Instagram Feed -->
<script src="https://elfsightcdn.com/platform.js" async></script>
<div class="elfsight-app-49a569e1-2fbc-490b-86a4-6feb90efb2dd" data-elfsight-app-lazy></div>`;

  const { error } = await supabase.from('settings').upsert({
    key: 'instagram_widget_code',
    value: code
  });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success!');
  }
}

updateSetting();
