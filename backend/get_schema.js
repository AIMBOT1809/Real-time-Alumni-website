import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gtnlvisbgevmihsmrbym.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getSchema() {
  const { data, error } = await supabase.rpc('get_schema_info');
  
  if (error) {
    console.log("RPC get_schema_info failed, trying SQL query via select from pg_catalog or information_schema...");
    // Let's run a select query that might work if we have permissions or we can query table structure by inserting a dummy row / looking at API.
    // An alternative: select information about the tables by running a raw query if RPC isn't set up.
    // Wait, let's see if we can query pg_attribute or information_schema. But wait, standard Supabase REST API doesn't allow direct SELECT from information_schema tables unless exposed via RPC.
    // Let's check if we can query it, or if we can get it from another RPC.
    // Let's write a query using RPC if it exists, or let's use a workaround.
    // What is a workaround? We can check the columns by inspecting the keys of a newly inserted/selected row, or by trying to select each column specifically.
    // Let's try select('chat_id') on messages. If it fails, then chat_id doesn't exist!
    const testQueries = [
      { table: 'messages', cols: ['id', 'conversation_id', 'sender_id', 'text', 'content', 'chat_id', 'attachment_url', 'created_at', 'read_at'] },
      { table: 'follow_requests', cols: ['id', 'sender_id', 'receiver_id', 'status', 'created_at'] },
      { table: 'connection_requests', cols: ['id', 'sender_id', 'receiver_id', 'status', 'created_at'] },
      { table: 'chats', cols: ['id', 'created_at'] },
      { table: 'chat_members', cols: ['id', 'chat_id', 'user_id'] },
      { table: 'conversations', cols: ['id', 'created_at'] },
      { table: 'conversation_participants', cols: ['id', 'conversation_id', 'user_id'] }
    ];

    for (const test of testQueries) {
      console.log(`Checking columns for table: ${test.table}`);
      for (const col of test.cols) {
        const { error: colErr } = await supabase.from(test.table).select(col).limit(1);
        if (colErr) {
          console.log(`  Column '${col}': NOT FOUND or ERROR: ${colErr.message}`);
        } else {
          console.log(`  Column '${col}': EXISTS`);
        }
      }
    }
  } else {
    console.log("Schema info from RPC:", data);
  }
}

getSchema();
