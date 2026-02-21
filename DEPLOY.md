# Deploy to GitHub + Vercel

This guide covers deploying the **frontend** to Vercel and the **backend** to a Node.js host (Railway or Render). The backend must run separately because it uses Express + MongoDB.

---

## 1. Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - College AI Voice Agent"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy Backend (Railway or Render)

### Option A: Railway (recommended)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. **New Project** → **Deploy from GitHub repo** → Select your repo
3. Railway may auto-detect. If not:
   - **Settings** → **Root Directory**: `backend`
   - **Build Command**: (leave empty or `npm install`)
   - **Start Command**: `npm start` or `node server.js`
4. **Variables** → Add all from `backend/.env`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `VAPI_PUBLIC_KEY`
   - `VAPI_PRIVATE_KEY`
   - `VAPI_ASSISTANT_ID`
   - `OPENAI_API_KEY`
   - `CLIENT_URL` = `https://your-vercel-app.vercel.app` (update after Vercel deploy)
5. **Deploy** → Copy the public URL (e.g. `https://your-app.up.railway.app`)

### Option B: Render

1. Go to [render.com](https://render.com) → Sign up
2. **New** → **Web Service** → Connect GitHub repo
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add **Environment Variables** (same as above)
7. Deploy → Copy the URL (e.g. `https://your-app.onrender.com`)

---

## 3. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New** → **Project** → Import your GitHub repo
3. Vercel auto-detects from `vercel.json`. Confirm:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build --prefix frontend`
   - **Output Directory**: `frontend/dist`
4. **Environment Variables** (add these):
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://your-backend-url.railway.app` (or Render URL) |
   | `VITE_VAPI_PUBLIC_KEY` | Your Vapi public key |
   | `VITE_VAPI_ASSISTANT_ID` | Your Vapi assistant ID |
5. **Deploy**

---

## 4. Update CORS and Webhook

1. **Backend** → Set `CLIENT_URL` = your Vercel URL (e.g. `https://your-app.vercel.app`)
2. **Vapi Dashboard** → Assistant → **Server URL** = `https://your-backend-url.railway.app/api/webhook/vapi`

---

## 5. Summary

| Component | Host | URL |
|-----------|------|-----|
| Frontend | Vercel | `https://xxx.vercel.app` |
| Backend | Railway/Render | `https://xxx.railway.app` |
| MongoDB | MongoDB Atlas | (in MONGODB_URI) |

**Important**: Never commit `.env` files. Use environment variables in each platform.
