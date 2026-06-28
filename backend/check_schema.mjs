/**
 * Check actual alumni_profiles columns in Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gtnlvisbgevmihsmrbym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  // Get one row to see all columns
  const { data, error } = await supabase.from('alumni_profiles').select('*').limit(3);
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  if (data && data.length > 0) {
    console.log('\n=== alumni_profiles COLUMNS ===');
    console.log(Object.keys(data[0]).join('\n'));
    console.log('\n=== SAMPLE ROW ===');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('No rows found');
  }

  // Check posts columns
  const { data: posts } = await supabase.from('posts').select('*').limit(1);
  if (posts && posts.length > 0) {
    console.log('\n=== posts COLUMNS ===');
    console.log(Object.keys(posts[0]).join('\n'));
    console.log('\n=== SAMPLE POST ===');
    console.log(JSON.stringify(posts[0], null, 2));
  }
}

main().catch(console.error);
