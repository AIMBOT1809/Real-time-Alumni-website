# Chat Feature - Quick Start Guide

## 5-Minute Setup

### 1. Database Setup (2 min)
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy and paste the contents of `backend/sql/chat_tables.sql`
4. Click "Run"
5. Wait for success message

### 2. Start Backend (1 min)
```bash
cd backend
npm install  # only first time
npm start
```

You should see:
```
Server running on port 3000
Socket.IO listening
```

### 3. Start Frontend (1 min)
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser

### 4. Test It! (1 min)

**Test in Two Browsers:**
- Window 1: Login as User A
- Window 2: Login as User B

**Steps:**
1. In Window 1: Dashboard → Chat → People
2. Find User B and click "+" to send request
3. In Window 2: Chat → Requests
4. Accept the request
5. In Window 1: Chat → Inbox
6. Click the conversation and start typing!
7. Message appears in Window 2 instantly ✨

## Key Files to Know

```
src/app/pages/Chat.tsx           ← Main chat UI
backend/chatRoutes.js             ← API endpoints
backend/server.js                 ← Socket.IO server
backend/sql/chat_tables.sql       ← Database schema
```

## Common Commands

```bash
# Start backend
cd backend && npm start

# Start frontend
npm run dev

# Build frontend
npm run build

# Check backend logs
# Look at terminal where backend is running
```

## Verify It's Working

**In Browser Console:**
```javascript
// Check Socket.IO connection
console.log('Socket connected:', socketRef.current?.connected)
```

**Should see:**
- Chat component loads
- Three tabs: Inbox, People, Requests
- Can search users
- No errors in console

## Troubleshooting

### Messages not sending?
1. Check backend is running (terminal shows "listening")
2. Check console for errors
3. Verify authentication token

### Socket not connecting?
1. Backend must be running on localhost:3000
2. Check CORS settings in backend/server.js
3. Restart frontend if backend started after

### Can't find users?
1. Make sure at least 2 users exist in database
2. Users must be in `profiles` table
3. Check they have different IDs (can't connect to self)

## Next Steps

- Read `CHAT_FEATURE_GUIDE.md` for full documentation
- Check `CHAT_TESTING_GUIDE.md` for testing checklist
- Review `CHAT_IMPLEMENTATION_SUMMARY.md` for architecture

## What You Can Do Now

✅ Send connection requests  
✅ Accept/decline requests  
✅ Send real-time messages  
✅ See read receipts  
✅ Search users and conversations  
✅ Switch between dark/light theme  

## Enjoy! 🎉

Your alumni network now has a modern chat system. Users can connect and communicate instantly!

---

**Need more help?** Check the documentation files mentioned above or review the code comments in `src/app/pages/Chat.tsx`.
