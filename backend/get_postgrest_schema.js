const supabaseUrl = 'https://gtnlvisbgevmihsmrbym.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A'

async function get() {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  console.log("Keys of response:", Object.keys(data));
  if (data.definitions) {
    console.log("Definitions keys:", Object.keys(data.definitions));
  } else if (data.components && data.components.schemas) {
    console.log("Schemas:", Object.keys(data.components.schemas));
  } else {
    console.log("Raw output:", JSON.stringify(data).slice(0, 1000));
  }
}

get().catch(console.error);
