# Deployment Guide for Vercel

This guide will help you deploy the Alumni Website frontend to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Supabase](https://supabase.com) project with the database set up
3. Your code pushed to a GitHub repository
4. Backend deployed (recommended: Render, Railway, or Fly.io)

## Architecture Overview

This project uses a split deployment strategy:
- **Frontend**: Deployed to Vercel (this guide)
- **Backend**: Deployed to Render (see `DEPLOYMENT.md` or `RENDER_DEPLOY.md`)

## Environment Variables Required

### Frontend (Vercel)

You need to set these environment variables in the Vercel dashboard:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `VITE_API_URL` | Backend API URL (e.g., `https://alumni-backend.onrender.com`) | Your backend service URL |

## Deployment Steps

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy the frontend**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **alumni-frontend** (or your preferred name)
   - In which directory is your code located? **./frontend**
   - Want to override settings? **No**

5. **Add environment variables**:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_API_URL
   ```

6. **Redeploy with environment variables**:
   ```bash
   vercel --prod
   ```

### Option 2: Using Vercel Dashboard (Git Integration)

1. **Push your code to GitHub** (if not already done)

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New..." → "Project"**

4. **Import your GitHub repository**

5. **Configure the project**:
   - **Project Name**: `alumni-frontend`
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

6. **Add environment variables**:
   - Click "Environment Variables"
   - Add the three variables listed above
   - Make sure to select "Production", "Preview", and "Development" as needed

7. **Click "Deploy"**

8. **Wait for deployment to complete** (usually 1-2 minutes)

### Option 3: Using vercel.json (Already Configured)

The `vercel.json` file in the root directory is already configured with:
- Build command for the frontend
- Output directory
- SPA routing (all routes redirect to index.html)
- Security headers

Simply run:
```bash
vercel --prod
```

## Post-Deployment

### 1. Update Backend CORS Settings

After deploying the frontend, update your backend's `CORS_ORIGIN` environment variable to include your Vercel frontend URL:

```
CORS_ORIGIN=https://alumni-frontend.vercel.app,https://alumni-frontend-*.vercel.app
```

The wildcard `*` allows all preview deployments.

### 2. Update Frontend API URL

Make sure `VITE_API_URL` points to your backend service URL (e.g., `https://alumni-backend.onrender.com`).

### 3. Test the Application

- Visit your Vercel URL (e.g., `https://alumni-frontend.vercel.app`)
- Test authentication, posts, events, and chat features
- Check browser console for any errors
- Verify Socket.io connections work (if using real-time features)

## Important Notes

### Vercel Free Tier

- **Automatic HTTPS**: All Vercel deployments include free SSL certificates
- **Global CDN**: Your app is served from edge locations worldwide
- **Preview Deployments**: Every git push creates a preview deployment
- **Custom Domains**: You can add custom domains for free

### Environment Variables

- Vercel environment variables are prefixed with `VITE_` to be accessible in the browser
- Never commit `.env` files to git (they're in `.gitignore`)
- Use `vercel env add` to add variables securely

### Build Configuration

The `vercel.json` file configures:
- **Build Command**: Builds the frontend from the `frontend/` directory
- **Output Directory**: Serves from `frontend/dist`
- **SPA Routing**: All routes redirect to `index.html` (required for React Router)
- **Security Headers**: Adds XSS protection, frame options, etc.

### Socket.io Considerations

If your app uses Socket.io for real-time features:
- The Socket.io client will connect to the backend URL specified in `VITE_API_URL`
- Ensure your backend allows CORS from your Vercel domain
- WebSocket connections work seamlessly with Vercel's infrastructure

## Troubleshooting

### Build Fails

- Check Vercel build logs for errors
- Ensure all dependencies are in `frontend/package.json`
- Verify Node.js version compatibility (Vercel uses Node 18+ by default)

### Environment Variables Not Working

- Ensure variables are prefixed with `VITE_`
- Redeploy after adding new environment variables
- Check that variables are set for the correct environment (Production/Preview/Development)

### Routing Issues (404 on Refresh)

- The `vercel.json` includes rewrites for SPA routing
- If issues persist, verify the rewrites configuration
- Ensure `outputDirectory` is set correctly

### CORS Errors

- Update backend `CORS_ORIGIN` to include your Vercel URL
- Include both production and preview URLs if needed
- Example: `https://alumni-frontend.vercel.app,https://alumni-frontend-*.vercel.app`

### Socket.io Connection Fails

- Verify `VITE_API_URL` points to the correct backend URL
- Check backend CORS settings
- Ensure backend is running and accessible

## Local Development

To run locally:
```bash
# Frontend
cd frontend
npm install
cp .env.example .env
# Edit .env with your local settings
npm run dev
```

## Updating Your Deployment

### Automatic Deployments

If you connected your GitHub repository:
- Every push to the main branch triggers a production deployment
- Every pull request creates a preview deployment
- You can configure this in Vercel dashboard → Settings → Git

### Manual Deployments

To manually deploy:
```bash
vercel --prod
```

## Custom Domain (Optional)

To add a custom domain:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `alumni.yourdomain.com`)
3. Follow the DNS configuration instructions
4. Vercel will automatically provision SSL certificate

## Monitoring and Analytics

Vercel provides:
- **Analytics**: View traffic, performance, and user behavior
- **Logs**: Real-time logs for debugging
- **Speed Insights**: Monitor Core Web Vitals

Access these from the Vercel Dashboard.

## Support

For issues with:
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- This project: Open an issue on GitHub

## Next Steps

1. ✅ Deploy backend to Render (see `DEPLOYMENT.md`)
2. ✅ Deploy frontend to Vercel (this guide)
3. ✅ Update CORS settings on backend
4. ✅ Test all features
5. ✅ Configure custom domain (optional)
6. ✅ Set up monitoring and alerts