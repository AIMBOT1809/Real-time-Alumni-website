# Deployment Guide for Render

This guide will help you deploy the Alumni Website to Render.

## Prerequisites

1. A [Render](https://render.com) account
2. A [Supabase](https://supabase.com) project with the database set up
3. Your code pushed to a GitHub repository

## Environment Variables Required

### Backend (alumni-backend)

You need to set these environment variables in the Render dashboard:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NODE_ENV` | Set to `production` | Pre-configured |
| `PORT` | Set to `5000` | Pre-configured |
| `CORS_ORIGIN` | Frontend URL (e.g., `https://alumni-frontend.onrender.com`) | Pre-configured |
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `JWT_SECRET` | Secret key for JWT tokens | Generate a secure random string |

### Frontend (alumni-frontend)

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `VITE_API_URL` | Backend API URL (e.g., `https://alumni-backend.onrender.com`) | Will be your backend service URL |

## Deployment Steps

### Option 1: Using Render Blueprint (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **"New +"** → **"Blueprint"**
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Click **"Apply"** to deploy both services

### Option 2: Manual Deployment

#### Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `alumni-backend`
   - **Runtime**: Node
   - **Plan**: Free
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
5. Add environment variables (see table above)
6. Click **"Create Web Service"**

#### Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure the site:
   - **Name**: `alumni-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `./frontend/dist`
4. Add environment variables (see table above)
5. Click **"Create Static Site"**

## Post-Deployment

1. **Update CORS settings**: After deploying the frontend, update the backend's `CORS_ORIGIN` environment variable to match your actual frontend URL.

2. **Update API URL**: Make sure the frontend's `VITE_API_URL` points to your backend service URL.

3. **Test the application**:
   - Visit your frontend URL
   - Test authentication, posts, events, and chat features
   - Check browser console and Render logs for any errors

## Important Notes

- **Free Tier Limitations**: Render's free tier services spin down after 15 minutes of inactivity. The first request after inactivity may take 30-50 seconds to respond.

- **Supabase Setup**: Ensure your Supabase project has all required tables (posts, events, comments, messages, conversations, etc.) and Row Level Security (RLS) policies configured.

- **Socket.io**: The backend uses Socket.io for real-time features. Render supports WebSocket connections on web services.

- **Custom Domains**: You can add custom domains to both services in the Render dashboard under Settings → Custom Domains.

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set correctly
- Ensure Supabase credentials are valid

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend service is running

### Socket.io connection issues
- Verify CORS_ORIGIN includes the frontend URL
- Check that Socket.io client is connecting to the correct backend URL

## Local Development

To run locally:

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your local settings
npm start

# Frontend (in a new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with your local settings
npm run dev
```

## Support

For issues with:
- Render: https://render.com/docs
- Supabase: https://supabase.com/docs
- This project: Open an issue on GitHub