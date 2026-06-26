import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gtnlvisbgevmihsmrbym.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A'

const supabase = createClient(supabaseUrl, supabaseKey)

const tables = [
  'alumni_profiles',
  'faculty_profiles',
  'student_profiles',
  'connection_requests',
  'conversations',
  'conversation_participants',
  'messages',
  'follow_requests',
  'chats',
  'chat_members',
  'posts',
  'events'
];

async function check() {
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table: ${table} -> ERROR: ${error.message} (${error.code})`);
    } else {
      console.log(`Table: ${table} -> SUCCESS (rows found: ${data.length})`);
      if (data.length > 0) {
        console.log(`  Sample row keys: ${Object.keys(data[0]).join(', ')}`);
      }
    }
  }
}

check();
