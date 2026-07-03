# Quick Start: Deploy to Render

## Step 1: Deploy via Blueprint (Easiest Method)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Click **"Connect a repository"** and select your GitHub repo: `AIMBOT1809/Real-time-Alumni-website`
4. Render will automatically detect the `render.yaml` file
5. Click **"Apply"**

## Step 2: Configure Environment Variables

After clicking "Apply", Render will show you the services it's about to create. Before clicking "Create", you need to add these environment variables:

### For Backend Service (alumni-backend):

Click on the backend service and add these **Secret Files** or **Environment Variables**:

**Required:**
- `SUPABASE_URL` - Get from: Supabase Dashboard → Settings → API → Project URL
- `SUPABASE_ANON_KEY` - Get from: Supabase Dashboard → Settings → API → anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Get from: Supabase Dashboard → Settings → API → service_role key
- `JWT_SECRET` - Generate a secure random string (e.g., use: https://randomkeygen.com/)

**Auto-configured (but verify):**
- `NODE_ENV` = `production`
- `PORT` = `5000`
- `CORS_ORIGIN` = `https://alumni-frontend.onrender.com` (update after frontend deploys)

### For Frontend Service (alumni-frontend):

Add these environment variables:

**Required:**
- `VITE_SUPABASE_URL` - Same as backend SUPABASE_URL
- `VITE_SUPABASE_ANON_KEY` - Same as backend SUPABASE_ANON_KEY
- `VITE_API_URL` - Will be: `https://alumni-backend.onrender.com` (use your actual backend URL)

## Step 3: Deploy

1. Click **"Create"** or **"Apply"** to start deployment
2. Render will automatically:
   - Install dependencies for both services
   - Build the frontend
   - Deploy both services
3. This process takes 3-5 minutes

## Step 4: Update CORS (Important!)

After the frontend deploys:

1. Go to your **backend service** in Render
2. Click **"Environment"** tab
3. Update `CORS_ORIGIN` to match your actual frontend URL (e.g., `https://alumni-frontend.onrender.com`)
4. Click **"Save Changes"** - this will trigger a redeploy of the backend

## Step 5: Test Your Application

1. Visit your frontend URL (shown in Render dashboard)
2. Test the following features:
   - User authentication (signup/login)
   - Create/view posts
   - Create/view events
   - Real-time chat
   - Notifications

## Your Live URLs

After deployment, you'll have:
- **Frontend**: `https://alumni-frontend.onrender.com` (or similar)
- **Backend API**: `https://alumni-backend.onrender.com` (or similar)
- **Backend Health Check**: `https://alumni-backend.onrender.com/api/posts`

## Troubleshooting

### Backend fails to start?
- Check Render logs: Dashboard → alumni-backend → Logs
- Verify all environment variables are set
- Ensure Supabase credentials are correct

### Frontend can't connect to backend?
- Verify `VITE_API_URL` points to correct backend URL
- Check that backend `CORS_ORIGIN` includes frontend URL
- Check browser console for errors

### Socket.io not working?
- Verify CORS settings in backend
- Check that frontend is connecting to correct backend WebSocket URL

## Need Help?

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Supabase Docs**: https://supabase.com/docs

## Next Steps

1. ✅ Deploy to Render using Blueprint
2. ✅ Set environment variables
3. ✅ Update CORS after frontend deploys
4. ✅ Test all features
5. 🎉 Share your live URL!

---

**Note**: Free tier services spin down after 15 minutes of inactivity. First request after inactivity may take 30-50 seconds.