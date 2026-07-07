# Debug Guide - Connect Button Failure

**Added**: Comprehensive logging to trace the exact failure point.

## How to Debug

### 1. Open Browser Console
- Press `F12` or `Ctrl+Shift+I` to open DevTools
- Go to **Console** tab
- Keep it open while testing

### 2. Test the Connect Button
1. Login to Alumni Directory
2. Click "Connect" on any alumnus
3. Watch **both** browser console AND backend logs

### 3. Check Console Logs

**Frontend logs will show:**
```
[AlumniGrid] Connect clicked for: [Name]
[AlumniGrid] Current User ID: [UUID]
[AlumniGrid] Target Alumni user_id: [UUID]
[AlumniGrid] Starting API call to POST /api/conversations
[AlumniGrid] Request body: { otherUserId: [UUID] }
[AlumniGrid] API Response status: 201 (or error code)
[AlumniGrid] API Success - Conversation ID: [UUID]
[AlumniGrid] Navigating to Chat with conversation ID: [UUID]
```

**Or if it fails:**
```
[AlumniGrid] API Error Response: { error: "specific error message" }
[AlumniGrid] Exception caught: [error details]
```

### 4. Check Backend Logs

**Backend logs will show:**
```
[POST /conversations] Current User ID: [UUID]
[POST /conversations] Other User ID (otherUserId): [UUID]
[POST /conversations] Checking for existing conversations for user: [UUID]
[POST /conversations] Found existing conversations: 0 (or number)
[POST /conversations] Creating new conversation
[POST /conversations] New conversation created with ID: [UUID]
[POST /conversations] Adding participants - User 1: [UUID] User 2: [UUID]
[POST /conversations] Participants added successfully
[POST /conversations] Emitting socket events
[POST /conversations] Returning created conversation
```

**Or if it fails, you'll see errors like:**
```
[POST /conversations] Error inserting conversation: { code: ..., message: "..." }
[POST /conversations] Error inserting participants: { code: ..., message: "..." }
```

---

## Common Failure Points

### Problem 1: RLS (Row Level Security) Error on Participants Insert

**Log shows:**
```
[POST /conversations] Error inserting participants: 
{ code: 'PGRST301', message: 'new row violates row level security policy' }
```

**Fix**: The RLS policy on `conversation_participants` is blocking the insert because `auth.uid()` doesn't match the users being inserted.

**Solution**: Check the RLS policies in Supabase:
1. Go to Supabase Dashboard
2. Database → Policies
3. Find `conversation_participants` table
4. Check policy allows inserting with any user_id (not just current user)

**Expected policy should be:**
```sql
-- Should allow inserting any user into any conversation
-- NOT just the authenticated user
```

### Problem 2: Missing `user_id` Field in Alumni

**Log shows:**
```
[AlumniGrid] Target Alumni user_id: undefined
```

**Fix**: The alumni object from the grid doesn't have the correct field name.

**Check**: Alumni profile uses different column names:
- Might be: `id`, `user_id`, `userId`, `profile_id`

**Solution**: 
1. Check what field contains the user ID
2. Update the code to use the correct field name

### Problem 3: Authentication Header Not Passed

**Log shows:**
```
[POST /conversations] Current User ID: undefined
```

**Fix**: The `x-user-id` header isn't being passed or read correctly.

**Check in browser Network tab:**
1. Open DevTools → Network tab
2. Click Connect button
3. Find the `POST /api/conversations` request
4. Check Request Headers
5. Should see: `x-user-id: [your-user-id]`

If missing, the frontend isn't passing it.

### Problem 4: User Not Logged In

**Log shows:**
```
[AlumniGrid] No user ID - user not logged in
```

**Fix**: The user is not properly authenticated. Make sure you're logged in before clicking Connect.

---

## Step-by-Step Testing

### Test 1: Verify User ID is Present

```javascript
// In browser console, paste:
const user = JSON.parse(localStorage.getItem('allumini_user'));
console.log('Stored user:', user);
console.log('User ID:', user?.id);
```

Expected: Should show your user UUID

### Test 2: Check Alumni Object

```javascript
// In browser console, after scrolling to alumni card:
// Right-click alumni card → Inspect
// Look for the data-user-id or similar attribute
// Or check React DevTools to see the alumni prop
```

Expected: Should have a user_id or similar field

### Test 3: Verify Backend Receives Request

1. Add breakpoint in `chatRoutes.js` at the start of POST endpoint
2. Click Connect button
3. Backend should pause at breakpoint
4. Check `req.userId` and `req.body.otherUserId` in debugger

Expected: Both should have UUIDs (not undefined/null)

### Test 4: Check Database Inserts

```sql
-- In Supabase SQL Editor, run:
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5;
SELECT * FROM conversation_participants ORDER BY joined_at DESC LIMIT 10;
```

After clicking Connect, these tables should have new rows.

---

## Verification Checklist

Before/After Testing:

- [ ] Frontend logs show all steps completing
- [ ] Backend logs show all steps completing
- [ ] API responds with 201 status (or 200 if existing)
- [ ] Response contains `id` (conversation UUID)
- [ ] Browser navigates to `/chat`
- [ ] Chat page loads
- [ ] Conversation is auto-selected
- [ ] Can send message

---

## Next Actions

**If logs show success but Chat doesn't load:**
- Check navigation implementation in Chat.tsx
- Verify route is correct
- Check `location.state` is being read

**If backend logs show RLS error:**
- Review RLS policies on conversation_participants
- May need to adjust policy to allow inserts

**If any field is `undefined`:**
- The field name doesn't match the schema
- Check actual column names in Supabase
- Update code to use correct field

---

## Important: Do NOT Ignore Logs

The added logging will tell you EXACTLY where it fails:

- **No frontend logs**: JavaScript error before logging
- **Frontend logs but no backend logs**: Network/request issue
- **Backend logs show query error**: Database/RLS issue
- **No error in logs but fails later**: Navigation issue

**Always check the logs first before guessing.**

---

## Running the Test

1. Start backend: `node server.js`
2. Start frontend: `npm run dev`
3. Open browser to http://localhost:5173
4. Open DevTools → Console (F12)
5. Click Connect button
6. **Read all the logs**
7. Note what the last successful log was
8. The next step is where it failed

**Report findings** with exact log messages (not guesses).

---

**Created**: July 8, 2024  
**Purpose**: Debug Connect button failure  
**Method**: Step-by-step logging analysis
