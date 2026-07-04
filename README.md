# Alumni website

This is a code bundle for Alumni website. The original project is available at https://www.figma.com/design/oSMaPjvhx064Ac8T9iwj9m/Alumni-website.

## Project Structure

- `frontend/` - React + Vite frontend application
- `backend/` - Express + Socket.io backend server

## Prerequisites

- Node.js (v18+)
- npm or pnpm

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials and CORS origins
npm start
```

The backend server will run on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials and backend API URL
npm run dev
```

The frontend dev server will run on `http://localhost:5173` by default.

## Environment Variables

### Frontend (`frontend/.env`)

- `VITE_API_URL` - Backend API URL (e.g., `http://localhost:5000` or your deployed backend URL)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Backend (`backend/.env`)

- `PORT` - Server port (default: 5000)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `CORS_ORIGIN` - Comma-separated list of allowed frontend origins

## Deployment

### Frontend

Build the frontend for production:

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

### Backend

Deploy the backend to your preferred hosting service (e.g., Render, Railway, Fly.io).

Make sure to:
1. Set the environment variables in your hosting platform
2. Update `VITE_API_URL` in the frontend `.env` to point to your deployed backend URL
3. Add your deployed frontend URL to `CORS_ORIGIN` in the backend `.env`

## Deploying to Render

This project includes a `render.yaml` file for easy deployment to Render.

### Prerequisites

1. Push your code to a GitHub repository
2. Create a [Supabase](https://supabase.com) project and note down your credentials
3. Sign up for [Render](https://render.com)

### Quick Deploy (Blueprint)

1. Go to the [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click **"Apply"** to deploy both backend and frontend services

### Manual Deployment

#### Backend Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `alumni-backend`
   - **Runtime**: Node
   - **Plan**: Free
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
4. Add environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `CORS_ORIGIN` = `https://alumni-frontend.onrender.com` (update after frontend deploys)
   - `SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_ANON_KEY` = Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
   - `JWT_SECRET` = A secure random string for JWT signing
5. Click **"Create Web Service"**

#### Frontend Static Site

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `alumni-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `./frontend/dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anonymous key
   - `VITE_API_URL` = `https://alumni-backend.onrender.com` (your backend URL)
5. Click **"Create Static Site"**

### Post-Deployment Steps

1. **Update CORS**: After the frontend deploys, update the backend's `CORS_ORIGIN` environment variable to match your actual frontend URL (e.g., `https://alumni-frontend.onrender.com`).

2. **Verify Environment Variables**: Double-check that all Supabase credentials are correctly set in both services.

3. **Test the Application**: Visit your frontend URL and test all features (authentication, posts, events, chat).

### Important Notes

- **Free Tier**: Render's free tier services spin down after 15 minutes of inactivity. The first request may take 30-50 seconds to respond.
- **WebSocket Support**: Socket.io is supported on Render web services for real-time features.
- **Custom Domains**: You can add custom domains in the Render dashboard under Settings → Custom Domains.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).