import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gtnlvisbgevmihsmrbym.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createDummy() {
  const email = `dummy${Date.now()}@example.com`;
  const password = "Password123!";
  
  console.log("Signing up user:", email);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'alumni',
      },
    },
  });

  if (authError) {
    console.error("Auth error:", authError);
    return;
  }

  if (!authData.user) {
    console.error("User not created, might need email confirmation disabled in Supabase.");
    return;
  }

  const userId = authData.user.id;
  console.log("Created user with ID:", userId);

  const { error: profileError } = await supabase
    .from('alumni_profiles')
    .insert([
      {
        user_id: userId,
        First_Name: "Dummy",
        Last_name: "Alumni",
        Email_Address: email,
        Phone_Number: "1234567890",
        College_Name: "TKR College",
        Department: "Computer Science",
        Year_of_Joining: "2018",
        Passed_Out_Year: "2022",
        Roll_Number: "CS1001",
        Current_Status: "working-professional",
        role: "alumni"
      }
    ]);

  if (profileError) {
    console.error("Profile error:", profileError);
    return;
  }

  console.log("\n==================================");
  console.log("Dummy user created successfully!");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("==================================\n");
}

createDummy();
