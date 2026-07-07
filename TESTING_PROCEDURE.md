# Connect Button Testing Procedure

**Goal**: Test the Connect button with comprehensive logging to identify the exact failure point.

**Status**: Logging implementation complete. Ready for testing.

---

## What Was Changed

### 1. Frontend (AlumniNetwork.tsx)
- Added 50+ lines of logging in `handleConnect()` function
- Logs: current user ID, target user ID, API request, API response, navigation
- Prefix: `[AlumniGrid]` for easy searching

### 2. Backend (chatRoutes.js)
- Added 80+ lines of logging in `POST /api/conversations` endpoint
- Logs: user IDs, database queries, participant insertion, socket events
- Prefix: `[POST /conversations]` for easy searching

### 3. Chat Component (Chat.tsx)
- Already has navigation state handling with `location.state?.conversationId`
- Will auto-select conversation when passed conversationId in state

---

## Testing Steps

### Step 1: Prepare Environment

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev

# Browser - Open http://localhost:5173
```

### Step 2: Open Browser Console

1. Open http://localhost:5173
2. Press `F12` to open DevTools
3. Click on **Console** tab
4. Keep console open while testing

### Step 3: Login and Navigate

1. Log in as a Student or Faculty user
2. Navigate to **Alumni Directory**
3. You should see alumni cards organized by graduation year and department

### Step 4: Click Connect Button

1. Find an alumni card
2. Click the **Connect** button
3. Watch **both** browser console and backend terminal simultaneously

### Step 5: Check Browser Console

You should see logs like:

```
[AlumniGrid] Connect clicked for: Alumni Name
[AlumniGrid] Current User ID: [uuid]
[AlumniGrid] Target Alumni user_id: [uuid]
[AlumniGrid] Starting API call to POST /api/conversations
[AlumniGrid] Request body: { otherUserId: "[uuid]" }
[AlumniGrid] API Response status: 201
[AlumniGrid] API Success - Conversation ID: [uuid]
[AlumniGrid] Navigating to Chat with conversation ID: [uuid]
```

**If you see all of these**: ✅ Frontend side works

**If you see an error**: ❌ Note the EXACT error message and error status code

### Step 6: Check Backend Console

You should see logs like:

```
[POST /conversations] Current User ID: [uuid]
[POST /conversations] Other User ID (otherUserId): [uuid]
[POST /conversations] Checking for existing conversations for user: [uuid]
[POST /conversations] Found existing conversations: 0
[POST /conversations] Creating new conversation
[POST /conversations] New conversation created with ID: [uuid]
[POST /conversations] Adding participants - User 1: [uuid] User 2: [uuid]
[POST /conversations] Participants added successfully
[POST /conversations] Emitting socket events
[POST /conversations] Returning created conversation
```

**If you see all of these**: ✅ Backend side works

**If you see an error**: ❌ Note the EXACT error message and error code

### Step 7: Check Chat Page

After clicking Connect, you should be:

1. Navigated to `/chat` page
2. The conversation should be auto-selected
3. You should see the alumni's name in the chat header
4. Message input box should be ready

**If you see this**: ✅ Navigation works

**If Chat page doesn't load**: ❌ Check browser console for JavaScript errors

---

## Troubleshooting

### Scenario 1: All logs show success but Chat doesn't load

**This means**: Navigation happened but Chat page has an issue

**Check**: 
- Browser console for JavaScript errors (red errors)
- Network tab to see if resources loaded
- Check if route `/chat` is configured correctly

**Fix**: Navigate to Chat page manually to see if it works without parameters

---

### Scenario 2: Frontend logs stop at "Starting API call"

**This means**: API request failed or took too long

**Check**:
- Browser Network tab → POST /api/conversations request
- Look at Response section → see what error was returned
- Status code (4xx = client error, 5xx = server error)

**Possible Issues**:
- `x-user-id` header not being sent (check Network tab Request Headers)
- Backend server not running
- Wrong API endpoint

---

### Scenario 3: API Response shows error status

**This means**: Backend rejected the request

**Common errors**:
- `400`: Missing otherUserId or other validation error
- `401`: Authentication failed (no x-user-id header)
- `500`: Database error (check backend logs)

**Check backend console** for exact error message

---

### Scenario 4: Backend logs show database error

**Most common**: RLS (Row Level Security) policy error on `conversation_participants` table

**Log would show**:
```
[POST /conversations] Error inserting participants: 
{ code: 'PGRST301', message: 'new row violates row level security policy' }
```

**Fix**: Check Supabase RLS policies
1. Go to Supabase Dashboard
2. Database → Policies
3. Find `conversation_participants` table
4. Check INSERT policy
5. Should allow inserts without restricting to auth.uid()

---

### Scenario 5: Alumni user_id is undefined

**Log shows**:
```
[AlumniGrid] Target Alumni user_id: undefined
```

**This means**: The alumni object doesn't have a `user_id` field

**Check**: 
1. What field contains the user ID on alumni profiles?
2. Could be: `id`, `user_id`, `userId`, `profile_id`
3. Update AlumniNetwork.tsx line with `alumni.user_id` to use correct field

---

## What to Record When Testing

If something fails, record:

1. **The exact last log message** (with the [prefix])
2. **The exact error message** (don't paraphrase)
3. **Error code if shown** (like 'PGRST301')
4. **Screenshot of logs** (browser console + backend terminal)

**Example of GOOD info to report**:
```
Last log: [POST /conversations] Error inserting participants: 
{ code: 'PGRST301', message: 'new row violates row level security policy' }
```

**Example of BAD info to report**:
```
"The API failed"
```

---

## Expected Success Flow

1. ✅ Click Connect button
2. ✅ Browser console shows [AlumniGrid] logs completing successfully
3. ✅ Backend console shows [POST /conversations] logs completing successfully
4. ✅ Navigate to Chat page
5. ✅ Conversation auto-selected
6. ✅ Can see other user's name
7. ✅ Can send message

---

## Code Review Before Testing

All logging has been added to:
- ✅ `frontend/src/app/pages/AlumniNetwork.tsx` (handleConnect function)
- ✅ `backend/chatRoutes.js` (POST /api/conversations endpoint)
- ✅ `frontend/src/app/pages/Chat.tsx` (already has navigation handling)

No functionality was changed, only logging added.

---

## Next Steps

1. Follow the testing steps above
2. Note where the logs stop
3. Read the exact error message
4. Check CONNECT_BUTTON_FIX.md for the specific error
5. Apply the fix
6. Re-test

If stuck:
- Copy the EXACT log messages
- Include error codes/messages
- Describe what happened (what you expected vs what you saw)

---

**Created**: July 8, 2026  
**Purpose**: Test Connect button with comprehensive logging  
**Method**: Step-by-step logging analysis  
**Status**: Ready for testing

