import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_URL'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_KEY'

const envStr = fs.readFileSync('.env.local', 'utf-8')
const envMatchUrl = envStr.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)
const envMatchKey = envStr.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)

const supabase = createClient(envMatchUrl[1], envMatchKey[1])

async function run() {
  const { data, error } = await supabase.from('players').select('*').limit(1)
  console.log(data)
  if (error) console.log(error)
}
run()
