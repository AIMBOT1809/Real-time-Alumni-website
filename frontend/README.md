
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
  