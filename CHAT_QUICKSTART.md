# Chat System - Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js installed
- Supabase project created
- Backend and frontend running

### Step 1: Environment Variables

**Backend** (`.env`):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=5000
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

**Frontend** (`.env`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

### Step 2: Run Backend

```bash
cd backend
npm install
node server.js
```

Expected output:
```
Supabase client initialized successfully
Server running on port 5000
Socket.io ready for connections
```

### Step 3: Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
VITE v... building for production and preview...
Local:  http://localhost:5173
```

### Step 4: Test Chat

1. Open http://localhost:5173
2. Login with test account
3. Go to Chat page
4. In "People" tab, click "Connect" on another user
5. Request appears in their "Requests" tab
6. They click "Accept"
7. Conversation appears in both inboxes
8. Send message and see it appear instantly

---

## Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads without errors
- [ ] Can login with user account
- [ ] Can view list of users in "People" tab
- [ ] Can send connection request
- [ ] Request appears in other user's "Requests"
- [ ] Can accept connection request
- [ ] Conversation appears in both inboxes
- [ ] Can send message in conversation
- [ ] Message persists after page refresh
- [ ] Message appears in other user's browser instantly
- [ ] Unread count updates in real-time

---

## Testing Two Users

### Browser 1: User A
```
1. Login as student@example.com
2. Go to Chat
3. Click "People" tab
4. Find Alumni User
5. Click "Connect"
6. Wait...
```

### Browser 2: User B
```
1. Login as alumni@example.com (different browser)
2. Go to Chat
3. See connection request in "Requests" tab
4. Click "Accept"
5. Check "Inbox" in Browser 1
```

### Browser 1 & 2: Send Messages
```
User A: Type message, press Enter
User B: See message instantly (no refresh needed)
User A: Refresh page, message still there
```

---

## Common Issues

### Issue: "Connection refused"
**Backend not running**: `node backend/server.js`

### Issue: "Supabase client not initialized"
**Check .env file**: Verify SUPABASE_URL and SUPABASE_ANON_KEY are set

### Issue: "Table does not exist"
**Run SQL migrations**: Execute `backend/sql/chat_tables.sql` in Supabase

### Issue: "CORS error"
**Update CORS_ORIGIN**: Add frontend URL to backend `.env`

### Issue: "Can't see other users"
**Check profiles table**: Ensure student/alumni/faculty profiles are created for test users

### Issue: "Messages not appearing in real-time"
**Check realtime subscription**: Open browser console, look for subscription logs

---

## Database Quick Check

In Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' 
AND table_name IN ('connection_requests', 'conversations', 'conversation_participants', 'messages');

-- Check data
SELECT * FROM connection_requests LIMIT 5;
SELECT * FROM conversations LIMIT 5;
SELECT * FROM messages LIMIT 5;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname='public' AND tablename IN ('connection_requests', 'conversations', 'conversation_participants', 'messages');
```

---

## API Endpoints Quick Test

### Using curl:

```bash
# Get conversations for user
curl -H "x-user-id: 12345" http://localhost:5000/api/conversations

# Get incoming requests
curl -H "x-user-id: 12345" http://localhost:5000/api/requests/incoming

# Send connection request
curl -X POST http://localhost:5000/api/requests \
  -H "x-user-id: 12345" \
  -H "Content-Type: application/json" \
  -d '{"receiverId": "67890"}'

# Send message
curl -X POST http://localhost:5000/api/conversations/convo-id/messages \
  -H "x-user-id: 12345" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello!"}'
```

---

## Performance Testing

### Message Load Test
```bash
# Send 100 messages to a conversation
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/conversations/{id}/messages \
    -H "x-user-id: user1" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Message $i\"}"
done
```

### User Load Test
```bash
# Create test users
# Generate student/alumni/faculty profiles
# Load test with multiple concurrent connections
```

---

## Debug Tips

### Enable Logs
**Backend**: Already logs connections and events
**Frontend**: Open DevTools console (F12)

### Monitor Socket Connections
```javascript
// In browser console
fetch('http://localhost:5000/api/conversations', {
  headers: { 'x-user-id': 'your-user-id' }
})
.then(r => r.json())
.then(d => console.log('Conversations:', d))
```

### Check Database Changes in Real-time
Supabase Console → Database → Tables → Enable real-time

### Verify Supabase Connection
```javascript
// In browser console
fetch('https://your-project.supabase.co/rest/v1/connection_requests?limit=1', {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-token'
  }
})
.then(r => r.json())
.then(d => console.log('Direct Supabase query:', d))
```

---

## Feature Checklist

### People Tab
- [ ] Shows all users (students, alumni, faculty)
- [ ] Excludes current user
- [ ] Shows avatar, name, role, department
- [ ] Search works
- [ ] Connect button sends request

### Requests Tab
- [ ] Shows incoming requests
- [ ] Shows sent requests
- [ ] Accept button works
- [ ] Reject button works
- [ ] Real-time updates when new request arrives

### Inbox Tab
- [ ] Shows all conversations
- [ ] Shows last message
- [ ] Shows unread count
- [ ] Shows time of last message
- [ ] Clicking opens chat

### Chat Area
- [ ] Message history loads
- [ ] Can send message
- [ ] Message appears in chat
- [ ] Message persists after refresh
- [ ] Real-time updates in two browsers
- [ ] Read indicators show
- [ ] Time formatting works

---

## Next Steps

1. ✅ Verify basic functionality
2. 📝 Test with multiple users
3. 🔒 Verify user isolation (can't see other users' conversations)
4. 📱 Test on mobile
5. 🚀 Deploy to production
6. 📊 Monitor performance in production

---

## Need Help?

- **Status**: See `CHAT_MIGRATION_COMPLETE.md`
- **Developer Docs**: See `CHAT_DEVELOPER_GUIDE.md`
- **Verify**: Run `node backend/verify_chat_migration.js`
- **Source Code**:
  - Backend: `backend/chatRoutes.js`, `backend/server.js`
  - Frontend: `frontend/src/app/pages/Chat.tsx`
  - Database: `backend/sql/chat_tables.sql`

---

**Happy chatting!** 🎉

Last Updated: July 8, 2024
