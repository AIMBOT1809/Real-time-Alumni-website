import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gtnlvisbgevmihsmrbym.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('alumni_profiles').select('*').limit(1)
  console.log('Alumni Data:', data)
  console.log('Alumni Error:', error)

  const { data: d2, error: e2 } = await supabase.from('faculty_profiles').select('*').limit(1)
  console.log('Faculty Data:', d2)
  console.log('Faculty Error:', e2)
}

test()
