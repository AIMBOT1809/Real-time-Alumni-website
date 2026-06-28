/**
 * Full System Test + Dummy Credentials Creator
 * Run: node test_full_system.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gtnlvisbgevmihsmrbym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const pass = (msg) => console.log(`${GREEN}✅ PASS${RESET}: ${msg}`);
const fail = (msg, err) => console.log(`${RED}❌ FAIL${RESET}: ${msg}`, err ? `→ ${err}` : '');
const info = (msg) => console.log(`${CYAN}ℹ  INFO${RESET}: ${msg}`);
const warn = (msg) => console.log(`${YELLOW}⚠  WARN${RESET}: ${msg}`);
const section = (title) => console.log(`\n${BOLD}${CYAN}══ ${title} ══${RESET}`);

const results = { pass: 0, fail: 0, warn: 0 };

async function checkTable(tableName, requiredColumns = []) {
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
      fail(`Table "${tableName}" → ${error.message}`);
      results.fail++;
      return false;
    }
    pass(`Table "${tableName}" accessible`);
    results.pass++;
    if (data && data.length > 0 && requiredColumns.length > 0) {
      const cols = Object.keys(data[0]);
      const missing = requiredColumns.filter(c => !cols.includes(c));
      if (missing.length > 0) {
        warn(`Table "${tableName}" missing columns: ${missing.join(', ')}`);
        results.warn++;
      }
    }
    return true;
  } catch (e) {
    fail(`Table "${tableName}" → exception: ${e.message}`);
    results.fail++;
    return false;
  }
}

async function testSupabaseConnection() {
  section('1. SUPABASE CONNECTION');
  try {
    const { data, error } = await supabase.from('alumni_profiles').select('count').limit(1);
    if (error && error.message.includes('does not exist')) {
      warn('alumni_profiles table does not exist yet — needs migration');
      results.warn++;
    } else if (error) {
      fail(`Supabase connection error: ${error.message}`);
      results.fail++;
    } else {
      pass('Supabase connection successful');
      results.pass++;
    }
  } catch(e) {
    fail(`Supabase connection exception: ${e.message}`);
    results.fail++;
  }
}

async function testAllTables() {
  section('2. DATABASE TABLES CHECK');
  
  const tables = [
    { name: 'alumni_profiles', cols: [] },
    { name: 'posts', cols: ['id', 'content', 'created_at'] },
    { name: 'events', cols: ['id', 'title', 'created_at'] },
    { name: 'connection_requests', cols: ['id', 'sender_id', 'receiver_id', 'status'] },
    { name: 'conversations', cols: ['id', 'created_at'] },
    { name: 'conversation_participants', cols: ['id', 'conversation_id', 'user_id'] },
    { name: 'messages', cols: ['id', 'conversation_id', 'sender_id', 'text'] },
  ];

  for (const t of tables) {
    await checkTable(t.name, t.cols);
  }

  // Check optional tables
  const optionalTables = ['admin_posts', 'alumni_highlights'];
  for (const t of optionalTables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error && error.message.includes('does not exist')) {
      warn(`Optional table "${t}" not found — some features may be disabled`);
      results.warn++;
    } else if (!error) {
      pass(`Optional table "${t}" exists`);
      results.pass++;
    }
  }
}

async function testRLSPolicies() {
  section('3. ROW LEVEL SECURITY (RLS) POLICIES');
  
  // Test anon read on alumni_profiles
  const { data: anonData, error: anonError } = await supabase
    .from('alumni_profiles').select('*').limit(5);
  if (anonError) {
    if (/permission|policy|unauthorized|RLS/i.test(anonError.message)) {
      fail('RLS blocking anon read on alumni_profiles — fix policies!', anonError.message);
      results.fail++;
    } else if (anonError.message.includes('does not exist')) {
      warn('alumni_profiles table not created yet');
      results.warn++;
    } else {
      fail('alumni_profiles read error', anonError.message);
      results.fail++;
    }
  } else {
    pass(`Anon can read alumni_profiles (${anonData?.length || 0} records found)`);
    results.pass++;
  }

  // Test anon read on posts
  const { data: postsData, error: postsError } = await supabase
    .from('posts').select('*').limit(5);
  if (postsError) {
    fail('posts read error (check RLS)', postsError.message);
    results.fail++;
  } else {
    pass(`Anon can read posts (${postsData?.length || 0} records found)`);
    results.pass++;
  }

  // Test anon read on events
  const { data: eventsData, error: eventsError } = await supabase
    .from('events').select('*').limit(5);
  if (eventsError) {
    fail('events read error (check RLS)', eventsError.message);
    results.fail++;
  } else {
    pass(`Anon can read events (${eventsData?.length || 0} records found)`);
    results.pass++;
  }
}

async function testAuthSystem() {
  section('4. AUTH SYSTEM — DUMMY CREDENTIALS TEST');

  const dummyUsers = [
    { email: 'test.alumni@tkr.edu', password: 'TestAlumni@123', role: 'alumni', name: 'Test Alumni' },
    { email: 'test.student@tkr.edu', password: 'TestStudent@123', role: 'student', name: 'Test Student' },
    { email: 'alumniconnect03@gmail.com', password: 'Alumni123@', role: 'admin', name: 'Admin' },
  ];

  for (const u of dummyUsers) {
    info(`Testing login for ${u.email} (${u.role})...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: u.email,
      password: u.password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        warn(`User ${u.email} does not exist yet — needs to be registered`);
        results.warn++;
      } else if (error.message.includes('Email not confirmed')) {
        warn(`User ${u.email} exists but email not confirmed`);
        results.warn++;
      } else {
        fail(`Login failed for ${u.email}: ${error.message}`);
        results.fail++;
      }
    } else if (data.user) {
      pass(`Login successful for ${u.email} (ID: ${data.user.id})`);
      results.pass++;
      // Sign out
      await supabase.auth.signOut();
    }
  }
}

async function testBackendServer() {
  section('5. BACKEND SERVER CHECK (port 5000)');
  try {
    const res = await fetch('http://127.0.0.1:5000/');
    if (res.status === 404) {
      pass('Backend server running on port 5000 (got 404 for /, expected)');
      results.pass++;
    } else {
      pass(`Backend server responding (status: ${res.status})`);
      results.pass++;
    }
  } catch(e) {
    fail('Backend server NOT running on port 5000 — start it with: node backend/server.js', e.message);
    results.fail++;
  }
}

async function testVerifyIdEndpoint() {
  section('6. VERIFY-ID ENDPOINT CHECK');
  try {
    const res = await fetch('http://127.0.0.1:5000/verify-id', { method: 'POST' });
    if (res.status === 400) {
      pass('/verify-id endpoint reachable (returned 400 for empty body — expected)');
      results.pass++;
    } else {
      pass(`/verify-id endpoint responding (status: ${res.status})`);
      results.pass++;
    }
  } catch(e) {
    fail('/verify-id endpoint not reachable', e.message);
    results.fail++;
  }
}

async function checkPostsSchema() {
  section('7. POSTS TABLE SCHEMA CHECK');
  
  const { data, error } = await supabase.from('posts').select('*').limit(1);
  if (error) {
    if (error.message.includes('does not exist')) {
      fail('posts table does not exist');
      results.fail++;
    } else {
      fail('posts table error', error.message);
      results.fail++;
    }
    return;
  }
  
  if (data && data.length > 0) {
    const cols = Object.keys(data[0]);
    const required = ['id', 'content', 'created_at', 'status', 'type'];
    const missing = required.filter(c => !cols.includes(c));
    if (missing.length > 0) {
      warn(`posts table missing: ${missing.join(', ')} — run SQL migrations`);
      results.warn++;
    } else {
      pass('posts table has all required columns');
      results.pass++;
    }
    info(`posts columns: ${cols.join(', ')}`);
  } else {
    warn('posts table is empty — no data to verify schema');
    results.warn++;
  }
}

// ── MAIN ──
async function main() {
  console.log(`\n${BOLD}${CYAN}╔═══════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   ALUMNI WEBSITE FULL SYSTEM AUDIT        ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚═══════════════════════════════════════════╝${RESET}`);
  console.log(`\nSupabase URL: ${SUPABASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  await testSupabaseConnection();
  await testAllTables();
  await testRLSPolicies();
  await testAuthSystem();
  await testBackendServer();
  await testVerifyIdEndpoint();
  await checkPostsSchema();

  section('SUMMARY');
  console.log(`${GREEN}PASS: ${results.pass}${RESET} | ${RED}FAIL: ${results.fail}${RESET} | ${YELLOW}WARN: ${results.warn}${RESET}`);

  if (results.fail > 0) {
    console.log(`\n${RED}${BOLD}❌ SYSTEM HAS CRITICAL ISSUES - see FAILs above${RESET}`);
  } else if (results.warn > 0) {
    console.log(`\n${YELLOW}${BOLD}⚠  SYSTEM MOSTLY OK - address warnings above${RESET}`);
  } else {
    console.log(`\n${GREEN}${BOLD}✅ ALL CHECKS PASSED - SYSTEM HEALTHY${RESET}`);
  }
}

main().catch(console.error);
