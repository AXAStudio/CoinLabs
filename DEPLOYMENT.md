# Deployment Guide: CoinLabs on Render

This guide walks you through deploying CoinLabs to Render.com, a free hosting platform that supports both frontend and backend applications.

## Why Render?

- ✅ Supports FastAPI backend with persistent processes (essential for your simulator)
- ✅ Hosts React/Vite frontend with automatic builds
- ✅ Free tier with generous limits
- ✅ Easy environment variable management
- ✅ GitHub integration for auto-deploy on push
- ✅ One dashboard for both frontend and backend

## Prerequisites

1. GitHub account (push your repo if not already there)
2. Render account (sign up at https://render.com with GitHub)
3. Supabase project set up (you already have this)

## Step 1: Push Code to GitHub

Make sure your CoinLabs repo is on GitHub:

```bash
cd /Users/andresalonso/Desktop/Projects/CoinLabs
git add .
git commit -m "Ready for Render deployment"
git push origin master
```

## Step 2: Deploy Backend to Render

### Create Backend Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (select AXAStudio/CoinLabs)
4. Configure:
   - **Name**: `coinlabs-api` (or your choice)
   - **Environment**: Python 3
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - **Plan**: Free

### Add Environment Variables

In the Web Service dashboard, go to **Environment** and add:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ENV=PRODUCTION
```

Get these values from your `.env` file.

5. Click **"Create Web Service"**
6. Wait for deployment (3-5 minutes)
7. Your backend URL will be like: `https://coinlabs-api.onrender.com`

**Save this URL** — you'll need it for the frontend.

## Step 3: Deploy Frontend to Render

### Create Frontend Web Service (Recommended)

1. Click **"New +"** → **"Web Service"**
2. Configure:
   - **Name**: `coinlabs-web` (or your choice)
   - **Environment**: Node
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`
   - **Plan**: Free
3. Click **"Create Web Service"**
4. Wait for deployment (3-5 minutes)
5. Your frontend URL will be like: `https://coinlabs-web.onrender.com`

### Add Environment Variables

In the Web Service dashboard, go to **Environment** and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

These env vars will be available during the build and at runtime.

### Why Web Service instead of Static Site?

Using a Web Service with `npm run preview` is more reliable for monorepo setups because:
- Avoids path resolution issues with Static Site's root directory handling
- Serves the built files correctly
- Simpler environment variable management
- Still uses the free tier

---

**Previous Note: Static Site Option (Not Recommended)**

If you prefer a Static Site deployment, you can use it, but be aware:
- Requires careful `rootDir` configuration
- Path resolution can be tricky in monorepos
- We recommend using Web Service for reliability

## Step 4: Connect Frontend to Backend

Once both are deployed, update your frontend to use the production backend URL.

### Option 1: Update Settings in App

1. Open your deployed frontend
2. Go to Settings
3. Change **API Base URL** to your Render backend URL
4. Example: `https://coinlabs-api.onrender.com`
5. Save settings (this persists in localStorage)

### Option 2: Update Code (Better for Fresh Deploys)

Edit `frontend/src/pages/Dashboard.tsx` to set the default API URL:

```typescript
const apiUrl = localStorage.getItem('apiUrl') || 'https://coinlabs-api.onrender.com';
```

And in `frontend/src/pages/Auth.tsx` similarly.

## Step 5: Test the Deployment

1. Visit your frontend URL: `https://coinlabs-web.onrender.com` (or whatever you named it)
2. Try to sign up / log in
3. Add a crypto asset
4. Check the browser console (F12) for any errors
5. Check the Render logs (Dashboard → Service → Logs) for backend issues

## Troubleshooting

### Backend returning 404 for `/crypto/portfolio`

- Make sure you updated the backend routing (should have `/crypto` prefix)
- Check the backend logs on Render dashboard
- Restart the service: Dashboard → Service → Manual Deploy

### Frontend not loading

- Check that the frontend Build Command ran successfully
- Verify the **Publish Directory** is set to `dist`
- Clear browser cache and refresh

### Auth not working

- Confirm Supabase env vars are set in both backend AND frontend
- Check that SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are correct
- Verify CORS: Backend has `allow_origins=["*"]` which should work

### Simulator not running

- Check backend logs for errors in `start_simulation()`
- Render free tier has 750 free hours/month — shared among all services
- If simulator uses heavy CPU, consider upgrading to paid plan

### Portfolio endpoint 404

- Verify backend has the `/crypto/portfolio` route
- Check that `apiUrl` in frontend settings points to correct backend URL
- Look at backend logs for routing errors

## Environment Variables Reference

### Backend (.env)

```
SUPABASE_URL=your_project.supabase.co
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key (keep private!)
ENV=PRODUCTION
```

### Frontend (VITE_* vars - only publishable keys)

```
VITE_SUPABASE_URL=your_project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## Updating Code After Deployment

Once deployed:

1. Push changes to GitHub
2. Render automatically redeploys
3. For frontend: Static site rebuilds, Web Service rebuilds and restarts
4. For backend: Automatically rebuilds and restarts

## Monitoring & Logs

- **Backend Logs**: Dashboard → Service → Logs
- **Frontend Logs**: Dashboard → Service → Logs (for build) or browser console (runtime)
- **Error Messages**: Check Render dashboard and browser DevTools (F12)

## Free Tier Limits

- **750 free hours/month** (shared across all services)
- 1 free PostgreSQL database
- Services spin down after 15 minutes of inactivity (cold start when accessed)
- No bandwidth limits

For production use, consider upgrading to Starter Plan ($7/month per service).

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Connect frontend to backend API URL
4. ✅ Test login and crypto features
5. Share your live URL!

For more help, visit: https://render.com/docs

