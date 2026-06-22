import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gtnlvisbgevmihsmrbym.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A'

const supabase = createClient(supabaseUrl, supabaseKey)

async function startBot() {
  console.log("Logging in as Dummy user bot...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'dummy1781624760105@example.com',
    password: 'Password123!'
  });

  if (authError) {
    console.error("Failed to login:", authError);
    return;
  }
  const myId = authData.user.id;
  console.log("Bot is online and listening! (Press Ctrl+C to stop)");

  async function acceptRequest(request) {
      console.log("Accepting request from:", request.sender_id);
      const { data: chat } = await supabase.from("chats").insert({}).select().single();
      if (!chat) return;
      await supabase.from("chat_members").insert([
        { chat_id: chat.id, user_id: request.sender_id },
        { chat_id: chat.id, user_id: request.receiver_id }
      ]);
      await supabase.from("follow_requests").update({ status: "accepted" }).eq("id", request.id);
      console.log("Request accepted and chat created.");
      
      // send initial message
      setTimeout(async () => {
         await supabase.from('messages').insert({
           chat_id: chat.id,
           sender_id: myId,
           content: "Hey there! I am your friendly test bot. We are now connected! Send me a message."
         });
      }, 1000);
  }

  // Auto-accept existing pending requests
  const { data: pendingReqs } = await supabase.from('follow_requests')
    .select('*').eq('receiver_id', myId).eq('status', 'pending');
  
  if (pendingReqs && pendingReqs.length > 0) {
    console.log("Found", pendingReqs.length, "pending requests.");
    for (const req of pendingReqs) {
      await acceptRequest(req);
    }
  }

  // Subscribe to new requests and messages
  supabase.channel('bot-events')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'follow_requests', filter: `receiver_id=eq.${myId}` }, (payload) => {
      console.log("Got a new follow request!");
      if (payload.new.status === 'pending') {
         acceptRequest(payload.new);
      }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
      const msg = payload.new;
      if (msg.sender_id !== myId) {
        // Is this message in a chat I am part of?
        const { data: membership } = await supabase.from('chat_members')
          .select('*').eq('chat_id', msg.chat_id).eq('user_id', myId);
        
        if (membership && membership.length > 0) {
          console.log("Received message:", msg.content);
          setTimeout(async () => {
             const replies = [
               "That's so cool!",
               "Haha, nice! The real-time chat is super fast.",
               "I am an AI bot written to test this chat system.",
               "Wow, the real-time chat works perfectly! Great job.",
               "Tell me more!",
               "Interesting... How did you build this?",
               "Are you having fun testing the app?"
             ];
             const reply = replies[Math.floor(Math.random() * replies.length)];
             await supabase.from('messages').insert({
               chat_id: msg.chat_id,
               sender_id: myId,
               content: reply
             });
             console.log("Sent reply:", reply);
          }, 1500); // 1.5s delay to make it feel human
        }
      }
    })
    .subscribe();
}

startBot();
