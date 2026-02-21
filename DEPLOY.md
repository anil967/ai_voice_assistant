# Deploy to GitHub + Vercel (Full-Stack, Single Project)

This project deploys **frontend + backend together** on Vercel. One deployment, one URL.

---

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "College AI Voice Agent - ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New** → **Project** → Import your GitHub repo
3. Vercel reads `vercel.json`. Confirm:
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build --prefix frontend`
   - **Output Directory**: `frontend/dist`
4. **Environment Variables** → Add these:

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A random secret (e.g. `your-super-secret-jwt-key`) |
   | `VAPI_PUBLIC_KEY` | Your Vapi public key |
   | `VAPI_PRIVATE_KEY` | Your Vapi private key |
   | `VAPI_ASSISTANT_ID` | Your Vapi assistant ID |
   | `OPENAI_API_KEY` | Your OpenAI API key |
   | `CLIENT_URL` | `https://your-app.vercel.app` (use your actual Vercel URL after first deploy) |
   | `VITE_VAPI_PUBLIC_KEY` | Same as VAPI_PUBLIC_KEY |
   | `VITE_VAPI_ASSISTANT_ID` | Same as VAPI_ASSISTANT_ID |

5. **Deploy** → Vercel builds frontend and deploys the API.

---

## 3. After First Deploy

1. Copy your Vercel URL (e.g. `https://college-ai-xxx.vercel.app`)
2. Update **CLIENT_URL** in Vercel Environment Variables to that URL
3. **Vapi Dashboard** → Assistant → **Server URL** = `https://your-app.vercel.app/api/webhook/vapi`

---

## 4. Summary

| Component | Host | URL |
|-----------|------|-----|
| Frontend + API | Vercel | `https://xxx.vercel.app` |
| MongoDB | MongoDB Atlas | (in MONGODB_URI) |

- **Frontend**: `https://xxx.vercel.app`
- **API**: `https://xxx.vercel.app/api/*`
- **Webhook**: `https://xxx.vercel.app/api/webhook/vapi`

**Note**: Do not set `VITE_API_URL` — frontend and backend share the same origin on Vercel.
