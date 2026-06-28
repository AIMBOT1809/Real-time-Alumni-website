/**
 * Create Dummy Test Users in Supabase
 * Run: node create_dummy_users.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gtnlvisbgevmihsmrbym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

async function createDummyUser(user) {
  console.log(`\n${CYAN}Creating user: ${user.email} (${user.role})...${RESET}`);

  // 1. Try to sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        name: user.name,
        role: user.role,
      },
      emailRedirectTo: null,
    },
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
      console.log(`${YELLOW}⚠  User already exists: ${user.email}${RESET}`);
      // Try to login instead
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });
      if (loginError) {
        console.log(`${RED}❌ Login also failed: ${loginError.message}${RESET}`);
        return null;
      }
      console.log(`${GREEN}✅ Existing user login OK: ${user.email}${RESET}`);
      const uid = loginData.user.id;
      await supabase.auth.signOut();
      return uid;
    }
    console.log(`${RED}❌ Signup failed: ${signUpError.message}${RESET}`);
    return null;
  }

  const uid = signUpData?.user?.id;
  if (!uid) {
    console.log(`${YELLOW}⚠  Signup returned no user ID (email confirmation may be required)${RESET}`);
    return null;
  }

  console.log(`${GREEN}✅ User created: ${user.email} (ID: ${uid})${RESET}`);

  // 2. Insert profile into alumni_profiles
  console.log(`  → Inserting profile into alumni_profiles...`);
  const profile = {
    user_id: uid,
    First_Name: user.firstName,
    Last_name: user.lastName,
    Email_Address: user.email,
    Phone_Number: user.phone,
    College_Name: 'TKR College of Engineering & Technology',
    Department: user.department,
    Roll_Number: user.rollNumber,
    Year_of_Joining: user.yearOfJoining,
    passed_out_year: user.passedOutYear || null,
    Passed_Out_Year: user.passedOutYear || null,
    LinkedIn_Profile_URL: user.linkedin || null,
    about: user.about || null,
    photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FDE68A&color=111827&size=256`,
    role: user.role,
  };

  const { error: profileError } = await supabase
    .from('alumni_profiles')
    .upsert(profile, { onConflict: 'user_id' });

  if (profileError) {
    console.log(`${YELLOW}⚠  Profile insert warning: ${profileError.message}${RESET}`);
  } else {
    console.log(`${GREEN}  ✅ Profile inserted successfully${RESET}`);
  }

  await supabase.auth.signOut();
  return uid;
}

async function main() {
  console.log(`\n${BOLD}${CYAN}╔═══════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   CREATE DUMMY TEST USERS                 ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚═══════════════════════════════════════════╝${RESET}`);

  const dummyUsers = [
    {
      email: 'test.alumni@tkr.edu',
      password: 'TestAlumni@123',
      role: 'alumni',
      name: 'Ravi Kumar',
      firstName: 'Ravi',
      lastName: 'Kumar',
      phone: '9876543210',
      department: 'Computer Science & Engineering',
      rollNumber: 'TKR17CS001',
      yearOfJoining: 2017,
      passedOutYear: 2021,
      linkedin: 'https://linkedin.com/in/ravikumar',
      about: 'Software Engineer at TCS. Passionate about AI/ML.',
    },
    {
      email: 'test.student@tkr.edu',
      password: 'TestStudent@123',
      role: 'student',
      name: 'Priya Sharma',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '9123456789',
      department: 'Computer Science & Data Science',
      rollNumber: 'TKR22CSD042',
      yearOfJoining: 2022,
      passedOutYear: 2026,
      about: 'Final year student interested in Data Science.',
    },
    {
      email: 'test.faculty@tkr.edu',
      password: 'TestFaculty@123',
      role: 'faculty',
      name: 'Dr. Anitha Rao',
      firstName: 'Anitha',
      lastName: 'Rao',
      phone: '9654321087',
      department: 'Computer Science & Engineering',
      rollNumber: 'FAC-CS-001',
      yearOfJoining: 2015,
      passedOutYear: null,
      about: 'Associate Professor | Research in Machine Learning',
    },
  ];

  console.log(`\n${BOLD}DUMMY CREDENTIALS SUMMARY:${RESET}`);
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ Role     │ Email                    │ Password              │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log('│ admin    │ alumniconnect03@gmail.com │ Alumni123@            │');
  console.log('│ alumni   │ test.alumni@tkr.edu       │ TestAlumni@123        │');
  console.log('│ student  │ test.student@tkr.edu      │ TestStudent@123       │');
  console.log('│ faculty  │ test.faculty@tkr.edu      │ TestFaculty@123       │');
  console.log('└─────────────────────────────────────────────────────────────┘');

  for (const user of dummyUsers) {
    await createDummyUser(user);
  }

  console.log(`\n${BOLD}${GREEN}✅ Done! Check your Supabase Auth dashboard to confirm email verification settings.${RESET}`);
  console.log(`\n${YELLOW}NOTE: If email confirmation is required, go to:${RESET}`);
  console.log(`  Supabase Dashboard → Auth → Settings → Disable "Enable email confirmations"`);
  console.log(`  OR confirm users manually in Auth → Users → click user → "Send email confirmation"`);
}

main().catch(console.error);
