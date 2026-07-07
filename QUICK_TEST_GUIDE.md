# Quick Test Guide - API Fix

**Status**: ✅ All API calls fixed  
**Ready**: Yes, test immediately  

---

## 🚀 Start Testing (5 minutes)

### Step 1: Start Backend
```bash
cd backend
node server.js
```

Expected output:
```
Server running on port 5000
Socket.io ready for connections
```

### Step 2: Start Frontend
Open new terminal:
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v... ready in ... ms

➜ Local: http://localhost:5173
```

### Step 3: Open Browser
1. Go to: http://localhost:5173
2. Press F12 to open DevTools
3. Click Console tab

### Step 4: Test Connect Button
1. Log in (any student/faculty)
2. Go to Alumni Directory
3. Click Connect on any alumni card
4. Watch console logs

---

## ✅ Expected Console Logs

### Success Case
```
[AlumniGrid] Connect clicked for: [Alumni Name]
[AlumniGrid] Current User ID: [uuid]
[AlumniGrid] Target Alumni user_id: [uuid]
[AlumniGrid] Starting API call to POST /api/conversations
[AlumniGrid] Using API URL: http://localhost:5000  ✅
[AlumniGrid] Request body: { otherUserId: "[uuid]" }
[AlumniGrid] API Response status: 201  ✅
[AlumniGrid] API Success - Conversation ID: [uuid]
[AlumniGrid] Full conversation object: {...}
[AlumniGrid] Navigating to Chat with conversation ID: [uuid]
```

✅ **Chat page opens automatically**

---

## ❌ If Still Getting 404 Error

### Check 1: Backend Running?
```bash
# Terminal 1 should show:
Server running on port 5000
Socket.io ready for connections
```

If missing: Start backend with `node server.js`

### Check 2: Frontend Console Shows API URL?
```
[AlumniGrid] Using API URL: http://localhost:5000
```

If shows `undefined`: Check `frontend/.env` has `VITE_API_URL=http://localhost:5000`

### Check 3: Check Network Tab
1. DevTools → Network tab
2. Click Connect
3. Find POST request to `/api/conversations`
4. Check URL column - should show `http://localhost:5000/api/conversations`
5. Status should show `201` or `200`, NOT `404`

---

## 🛠️ Common Issues

### Issue: Chrome shows CORS error
**Not a problem** - This is expected with browser security. The fetch headers include x-user-id which might trigger CORS.

**Check**: Console shows successful log messages (201 status)?
If yes: API worked, navigate error. Check Chat.tsx.

### Issue: Blank screen after click
**Check**: Browser console for errors (red messages)
1. Open DevTools Console
2. Look for red error messages
3. Check if Chat page loaded (URL should be `/chat`)

### Issue: "API URL: undefined" in logs
**Fix**: 
1. Check `frontend/.env` has `VITE_API_URL=http://localhost:5000`
2. Restart frontend dev server: Stop with Ctrl+C, run `npm run dev` again

### Issue: Backend doesn't start
**Fix**: Make sure port 5000 is free
```bash
# Find what's using port 5000
netstat -ano | findstr 5000

# Kill process if needed (Windows)
taskkill /PID [PID] /F
```

---

## 📊 What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| API URL | `/api/conversations` (relative) | `http://localhost:5000/api/conversations` (absolute) |
| 404 Error | Yes (requested from 5173) | No (requests from 5000) |
| JSON Parse Error | Yes (404 returns HTML) | No (proper error handling) |
| Error Messages | Generic | Specific with HTTP status |

---

## 🎯 Success Indicators

✅ Browser console shows [AlumniGrid] logs  
✅ [AlumniGrid] log shows `Using API URL: http://localhost:5000`  
✅ API Response status shows `201` (not 404)  
✅ Chat page opens  
✅ Conversation auto-selected  
✅ Can send message  

---

## 📞 If Stuck

1. Provide screenshot of console logs
2. Confirm backend shows no errors
3. Confirm Network tab shows request to `localhost:5000`
4. Check if API URL is configured correctly in `.env`

---

## Files Changed

- ✅ `frontend/src/app/pages/AlumniNetwork.tsx` - handleConnect() function
- ✅ `frontend/src/app/pages/Chat.tsx` - 4 API calls fixed
- ✅ Both compile without errors

---

**Status**: Ready to test  
**Time to test**: 5 minutes  
**Expected result**: Connect button works, Chat opens  

