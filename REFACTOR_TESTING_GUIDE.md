# Chat Refactor - Testing Guide

## Quick Test (5 minutes)

### 1. Start Services
```bash
# Terminal 1: Backend
cd backend
npm install
node server.js

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### 2. Test Flow
1. **Open** http://localhost:5173
2. **Login** as User A (student or alumni)
3. **Navigate** to Alumni Directory (Networking menu)
4. **Search** or browse for another alumni
5. **Click** the "Connect" button
6. **Verify** redirect to Chat page
7. **Check** conversation is automatically selected
8. **Type** a message and press Enter
9. **Verify** message appears
10. **Open** second browser window as User B
11. **Login** as the other user
12. **Navigate** to Chat
13. **Verify** same conversation appears in inbox
14. **Type** response as User B
15. **Check** User A receives message in real-time

---

## Detailed Test Cases

### Test 1: Create New Conversation
**Expected**: Conversation created instantly, Chat opens with it selected

```
1. Login as Student A
2. Go to Alumni Directory
3. Click Connect on Alumni B
4. Should redirect to /chat
5. Conversation should be pre-selected
6. Message input should be focused
```

**Pass Criteria**: ✅ Conversation opens automatically with pre-selected contact

### Test 2: Find Existing Conversation
**Expected**: Returns existing conversation ID instead of creating duplicate

```
1. From Test 1, have an open conversation with Alumni B
2. Go back to Alumni Directory
3. Click Connect on same Alumni B again
4. Should redirect to /chat with same conversation
5. Message history should be preserved
```

**Pass Criteria**: ✅ Same conversation found, no duplicate created

### Test 3: Real-time Messaging
**Expected**: Messages appear instantly in both browsers

```
1. Open Chat in Browser 1 (User A)
2. Open Chat in Browser 2 (User B) - same conversation
3. User A types "Hello" and presses Enter
4. User B should see "Hello" without refresh
5. User B types "Hi there" 
6. User A should see response instantly
```

**Pass Criteria**: ✅ Messages appear in real-time

### Test 4: Message Persistence
**Expected**: Messages persist after page refresh

```
1. Send message as User A
2. Refresh page
3. Message should still be visible
4. Logout and login again
5. Message should still be there
```

**Pass Criteria**: ✅ Messages persist through refresh and re-login

### Test 5: No Redundant Tabs
**Expected**: Chat no longer has People or Requests tabs

```
1. Open Chat page
2. Look at sidebar
3. Should see ONLY message list (no tabs above)
```

**Pass Criteria**: ✅ People tab gone, Requests tab gone

### Test 6: Inbox Displays Correctly
**Expected**: Inbox shows only actual conversations

```
1. User A has conversations with Alumni B, C, D
2. Open Chat
3. Inbox should list all 3 conversations
4. No "People" section
5. No pending requests
```

**Pass Criteria**: ✅ Only real conversations shown

### Test 7: Search Works
**Expected**: Conversation list filtered by name

```
1. Have multiple conversations
2. Type "John" in search box
3. Only conversations with "John" should show
4. Clear search
5. All conversations return
```

**Pass Criteria**: ✅ Search filters correctly

### Test 8: Mobile Responsiveness
**Expected**: Works on mobile view

```
1. Open in browser DevTools mobile view
2. Alumni Directory works
3. Connect button works
4. Chat page works
5. Messaging works
```

**Pass Criteria**: ✅ All features work on mobile

### Test 9: User Isolation
**Expected**: User A only sees conversations with people they messaged

```
1. User A has conversation with User B
2. User C has conversation with User B (separate)
3. User A should NOT see User C's conversation
4. User C should NOT see User A's conversation
```

**Pass Criteria**: ✅ No cross-user data leakage

### Test 10: Unread Counts
**Expected**: Unread messages counted correctly

```
1. User B sends message to User A
2. User A's inbox should show badge with "1"
3. Click conversation
4. Badge should disappear
5. Refresh page
6. Badge still gone
```

**Pass Criteria**: ✅ Unread count accurate

---

## API Testing

### Test POST /api/conversations

**Create new conversation:**
```bash
curl -X POST http://localhost:5000/api/conversations \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1-id" \
  -d '{
    "otherUserId": "user-2-id"
  }'
```

**Expected Response** (201):
```json
{
  "id": "convo-id-uuid",
  "created_at": "2024-07-08T...",
  "updated_at": "2024-07-08T..."
}
```

**Find existing conversation:**
```bash
# Call same endpoint with same IDs
# Should return 200 with existing conversation ID
```

**Invalid requests:**
```bash
# Missing otherUserId
curl -X POST http://localhost:5000/api/conversations \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1-id" \
  -d '{}'

# Expected: 400 error

# Self conversation
curl -X POST http://localhost:5000/api/conversations \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1-id" \
  -d '{
    "otherUserId": "user-1-id"
  }'

# Expected: 400 error
```

---

## Browser DevTools Debugging

### Console Checks
```javascript
// Should see no errors related to:
// - "view is undefined" 
// - "People tab" 
// - "connection_requests"

// Should see navigation logs:
// "Redirecting to chat"
// "Conversation created"
```

### Network Tab
```
POST /api/conversations ✅ (creates conversation)
GET /api/conversations ✅ (loads inbox)
POST /api/conversations/:id/messages ✅ (sends message)
```

### React DevTools
```
Chat component should show:
- No "view" state
- No "people" state
- No "requests" state
- Only: conversations, selectedConversation, messages
```

---

## Database Verification

### Check tables are intact
```sql
SELECT * FROM conversations LIMIT 5;
SELECT * FROM conversation_participants LIMIT 5;
SELECT * FROM messages LIMIT 5;
```

### Verify no duplicates
```sql
-- After creating conversation twice with same users
SELECT * FROM conversations 
WHERE id IN (
  SELECT conversation_id FROM conversation_participants 
  WHERE user_id = 'user-1' AND conversation_id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = 'user-2'
  )
);

-- Should return exactly 1 conversation
```

---

## Error Scenarios

### User Not Logged In
```
1. In Alumni Directory, not logged in
2. Click Connect
3. Should show: "Please log in to start a conversation"
```

**Pass**: ✅ Error message shown

### User Tries to Message Self
```
1. Somehow try to create conversation with self
2. Should show error: "Cannot create conversation with yourself"
```

**Pass**: ✅ Error prevented

### Backend Down
```
1. Stop backend server
2. Click Connect
3. Should show: "Failed to start conversation"
```

**Pass**: ✅ Graceful error handling

### Network Error
```
1. Disable internet (or DevTools throttle)
2. Click Connect
3. Should show: "Failed to start conversation"
4. Enable internet
5. Try again
6. Should work
```

**Pass**: ✅ Handles network errors

---

## Checklist

### Code Quality
- [ ] No console errors
- [ ] No console warnings about old code
- [ ] Chat component compiles
- [ ] AlumniNetwork component compiles
- [ ] Backend routes compile

### Functionality
- [ ] Connect button works
- [ ] Chat opens after connect
- [ ] Conversation auto-selects
- [ ] Messages send/receive
- [ ] Messages persist
- [ ] Search works
- [ ] No People tab
- [ ] No Requests tab

### UX
- [ ] One-click to start chatting
- [ ] Clear error messages
- [ ] Loading states
- [ ] Success feedback
- [ ] Mobile works

### Data
- [ ] No duplicate conversations
- [ ] User isolation maintained
- [ ] Message history preserved
- [ ] Unread counts correct

### Performance
- [ ] Chat page loads quickly
- [ ] No lag on message send
- [ ] Real-time is instant
- [ ] Search is responsive

---

## Sign-Off

Once all test cases pass:
- [ ] Chat Refactor verified working
- [ ] Ready for production
- [ ] No rollback needed

**Tester**: _________________  
**Date**: _________________  
**Status**: ✅ APPROVED

---

## Troubleshooting

### "Chat component still shows tabs"
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check you're running latest code

### "Connect button doesn't work"
- Check backend is running
- Check network tab for API errors
- Check browser console for JavaScript errors

### "Conversation doesn't auto-select"
- Check you're redirected to /chat
- Check browser console for errors
- Check location.state in React DevTools

### "Messages not appearing"
- Check socket.io connection
- Check realtime subscriptions active
- Check no database errors
- Try refresh

### "Duplicate conversations created"
- Check POST endpoint is finding existing conversations
- Clear conversations list and try again
- Check database for duplicates

---

**Last Updated**: July 8, 2024  
**Test Duration**: ~30 minutes for all tests  
**Difficulty**: Medium (requires two users/browsers)
