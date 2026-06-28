import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = 'https://gtnlvisbgevmihsmrbym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const mockAlumni = [
  {
    First_Name: 'Alex',
    Last_name: 'Johnson',
    Email_Address: 'alex.j@example.com',
    Department: 'Computer Science',
    Passed_Out_Year: 2020,
    role: 'alumni',
    about: 'Currently building scalable microservices at Google.',
    career_status: 'Senior Software Engineer',
    Organization_Name: 'Google',
    achievement: 'Promoted to Senior Engineer in 3 years.',
  },
  {
    First_Name: 'Sarah',
    Last_name: 'Williams',
    Email_Address: 'sarah.w@example.com',
    Department: 'Computer Science',
    Passed_Out_Year: 2020,
    role: 'alumni',
    about: 'Data Scientist specializing in NLP.',
    career_status: 'Data Scientist',
    Organization_Name: 'Amazon',
    achievement: 'Published 2 papers on transformer models.',
  },
  {
    First_Name: 'Michael',
    Last_name: 'Chen',
    Email_Address: 'michael.c@example.com',
    Department: 'Information Technology',
    Passed_Out_Year: 2021,
    role: 'alumni',
    about: 'Cybersecurity analyst protecting enterprise networks.',
    career_status: 'Security Analyst',
    Organization_Name: 'Microsoft',
    achievement: 'Discovered a critical zero-day vulnerability.',
  },
  {
    First_Name: 'Emily',
    Last_name: 'Davis',
    Email_Address: 'emily.d@example.com',
    Department: 'Information Technology',
    Passed_Out_Year: 2021,
    role: 'alumni',
    about: 'Frontend developer passionate about UX/UI.',
    career_status: 'Frontend Developer',
    Organization_Name: 'Meta',
    achievement: 'Led the redesign of the main user dashboard.',
  },
  {
    First_Name: 'David',
    Last_name: 'Miller',
    Email_Address: 'david.m@example.com',
    Department: 'Computer Science',
    Passed_Out_Year: 2019,
    role: 'alumni',
    about: 'Engineering Manager leading a team of 15.',
    career_status: 'Engineering Manager',
    Organization_Name: 'Netflix',
    achievement: 'Successfully delivered the new streaming architecture.',
  },
  {
    First_Name: 'Jessica',
    Last_name: 'Wilson',
    Email_Address: 'jessica.w@example.com',
    Department: 'Electronics and Communication',
    Passed_Out_Year: 2022,
    role: 'alumni',
    about: 'Embedded systems engineer working on IoT devices.',
    career_status: 'Embedded Engineer',
    Organization_Name: 'Tesla',
    achievement: 'Designed the primary control board for the new model.',
  },
  {
    First_Name: 'Daniel',
    Last_name: 'Taylor',
    Email_Address: 'daniel.t@example.com',
    Department: 'Electronics and Communication',
    Passed_Out_Year: 2020,
    role: 'alumni',
    about: 'Working on 5G network infrastructure.',
    career_status: 'Network Engineer',
    Organization_Name: 'Cisco',
    achievement: 'Deployed 5G nodes in 5 major cities.',
  },
  {
    First_Name: 'Sophia',
    Last_name: 'Anderson',
    Email_Address: 'sophia.a@example.com',
    Department: 'Computer Science',
    Passed_Out_Year: 2022,
    role: 'alumni',
    about: 'Recent graduate working as a backend developer.',
    career_status: 'Software Engineer',
    Organization_Name: 'Stripe',
    achievement: 'Integrated 3 new payment gateways.',
  }
];

async function insertMockData() {
  console.log('Inserting mock alumni data...');
  for (const alumni of mockAlumni) {
    const user_id = crypto.randomUUID();
    const profile = {
      ...alumni,
      user_id,
      Roll_Number: '21K91A0' + (Math.floor(Math.random() * 900) + 100),
      Year_of_Joining: alumni.Passed_Out_Year - 4,
      photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(alumni.First_Name + ' ' + alumni.Last_name)}&background=FDE68A&color=111827&size=256`,
    };

    const { error } = await supabase.from('alumni_profiles').insert(profile);
    if (error) {
      console.error(`Failed to insert ${alumni.First_Name}:`, error.message);
    } else {
      console.log(`Inserted ${alumni.First_Name} ${alumni.Last_name}`);
    }
  }
  console.log('Done!');
}

insertMockData();
