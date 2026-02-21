# 🎓 College AI Voice Agent — Enquiry System

> **An AI-powered voice agent platform for colleges to automate student admissions enquiries using real-time voice calls, database-driven responses, and a full admin dashboard.**

---

## 📌 Project Overview

Students waste hours trying to get basic admission information. This system replaces the phone-based enquiry queue with an **AI Voice Agent** that answers 24/7, knows the college's real course/fee/hostel data from a database, and logs every call for admin review.

### Core Idea
```
Student dials phone number
        ↓
Vapi AI Voice Agent picks up
        ↓
Speaks using dynamic data from MongoDB
        ↓
Answers: Courses, Fees, Hostel, Admissions
        ↓
Admin reviews full call logs in dashboard
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│  Public Site: Home / Courses / Facilities / Admissions       │
│  Admin Panel: Dashboard / Agent Control / Call Logs / Settings│
│  Voice Modal: Browser-based AI call (Vapi Web SDK)           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / Vite Proxy → /api
┌────────────────────────▼────────────────────────────────────┐
│                     BACKEND (Node.js + Express)              │
│  /api/auth      → JWT login / register                       │
│  /api/college   → College info CRUD                          │
│  /api/agent     → Agent config CRUD                          │
│  /api/calls     → Call history logs                          │
│  /api/vapi      → Vapi assistant sync + phone numbers        │
│  /api/webhook   → Vapi webhook events (call logging)         │
│  /api/ai        → Local AI fallback (keyword engine)         │
└────────────────────────┬────────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────────┐
│           MongoDB Atlas (Cloud Database)                     │
│  Collections: users, collegeinfos, agentconfigs,            │
│               calllogs, messagetemplates                     │
└─────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Vapi AI Platform                            │
│  Phone Number → Assistant → GPT-3.5-turbo                   │
│  System prompt injected from MongoDB via Management API      │
│  Webhook events sent back to /api/webhook                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS |
| **UI Components** | Lucide Icons, react-hot-toast |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas, Mongoose |
| **Auth** | JWT (JSON Web Tokens) + bcryptjs |
| **AI Voice** | Vapi AI (Web SDK + Phone + Management API) |
| **Logging** | Winston + Morgan |
| **Email** | Nodemailer (post-call follow-up) |
| **Security** | Helmet, CORS, express-rate-limit, compression |

---

## 📂 Project Structure

```
major project/
├── package.json              ← Root: runs both servers with concurrently
│
├── frontend/                 ← React + Vite App
│   ├── index.html
│   ├── vite.config.js        ← Proxy: /api → localhost:5000
│   ├── tailwind.config.js
│   ├── .env                  ← VITE_VAPI_PUBLIC_KEY, VITE_VAPI_ASSISTANT_ID
│   └── src/
│       ├── main.jsx          ← App entry point
│       ├── App.jsx           ← Router + Public/Admin layout
│       ├── index.css         ← Tailwind + custom animations
│       ├── api/index.js      ← Axios API service layer
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── VoiceCallModal.jsx   ← Vapi Web SDK voice call
│       │   └── ProtectedRoute.jsx  ← JWT route guard
│       ├── layouts/
│       │   └── AdminLayout.jsx     ← Sidebar admin shell
│       └── pages/
│           ├── Home.jsx / About.jsx / Courses.jsx
│           ├── Facilities.jsx / Admissions.jsx
│           ├── NotFound.jsx
│           └── admin/
│               ├── Login.jsx        ← JWT auth
│               ├── DashboardHome.jsx← Stats + charts
│               ├── CollegeInfo.jsx  ← Edit college data
│               ├── AgentControl.jsx ← Sync DB → Vapi + phone numbers
│               ├── CallHistory.jsx  ← View call logs
│               ├── LiveMonitor.jsx
│               ├── Automation.jsx
│               └── Settings.jsx
│
├── backend/                  ← Express API Server
│   ├── server.js             ← Main entry, middleware, routes
│   ├── seed.js               ← Seeds admin user + sample college data
│   ├── .env                  ← All secrets (Mongo, JWT, Vapi, SMTP)
│   ├── models/
│   │   ├── User.js           ← Admin user (bcrypt password)
│   │   ├── CollegeInfo.js    ← Courses, fees, facilities, contact
│   │   ├── AgentConfig.js    ← AI tone, fallback message, prompt
│   │   ├── CallLog.js        ← Call records from Vapi webhook
│   │   └── MessageTemplate.js← Email templates
│   ├── routes/
│   │   ├── auth.js           ← POST /login, /register
│   │   ├── college.js        ← GET/PUT college info
│   │   ├── agent.js          ← GET/PUT agent config
│   │   ├── calls.js          ← GET call history
│   │   ├── vapi.js           ← POST /sync, GET /assistant, /phone-numbers
│   │   ├── webhook.js        ← Vapi event handler (call logging + email)
│   │   └── ai.js             ← Local AI fallback (free mode)
│   ├── middleware/
│   │   └── auth.js           ← JWT protect + adminOnly guards
│   └── utils/
│       ├── logger.js         ← Winston logger (console + file)
│       ├── email.js          ← Nodemailer post-call follow-up email
│       └── vapiSync.js       ← Builds prompt from DB → Vapi API update
```

---

## ⚙️ Environment Variables

### `backend/.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/db
JWT_SECRET=your_jwt_secret

VAPI_PUBLIC_KEY=ab75364e-...
VAPI_PRIVATE_KEY=4cce8e28-...
VAPI_ASSISTANT_ID=131f3b53-...
VAPI_WEBHOOK_SECRET=

SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### `frontend/.env`
```env
VITE_VAPI_PUBLIC_KEY=ab75364e-...
VITE_VAPI_ASSISTANT_ID=131f3b53-...
VITE_API_URL=http://localhost:5000
```

---

## 🛠️ Quick Start

```bash
# 1. Clone and install all dependencies
git clone <repo>
cd "major project"
npm run install:all

# 2. Configure environment variables
# Edit backend/.env and frontend/.env with your keys

# 3. Seed the database (creates admin user + sample college data)
node backend/seed.js

# 4. Start both servers with one command
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:5173/admin/login

---

## 🔑 Default Admin Credentials

| Field | Value |
|---|---|
| Email | `admin@college.com` |
| Password | `admin123` |

> Change these immediately after first login via Admin → Settings.

---

## 📞 Vapi Phone Number Setup

1. Buy a phone number at [dashboard.vapi.ai/phone-numbers](https://dashboard.vapi.ai/phone-numbers)
2. Under **Inbound Settings**, select your assistant
3. Click **Save**
4. In the admin panel → **AI Agent** → click **"Sync Now"**

The AI will now answer that phone number using your live college database. Every call is logged automatically.

---

## 🤖 How the AI Knows Your Data

```
Admin updates College Info (courses, fees, hostel)
             ↓
  Clicks "Sync Now" in AI Agent panel
             ↓
  Backend reads MongoDB CollegeInfo collection
             ↓
  Builds rich system prompt:
  "You are AI for Skyline Tech.
   Courses: B.Tech CS — ₹1.5L/yr, 4 years...
   Hostel: ₹60K/yr, Wi-Fi + gym..."
             ↓
  PATCH https://api.vapi.ai/assistant/{id}
             ↓
  Assistant updated instantly ✅
  All future calls use latest data
```

---

## 🎙️ Voice Call Modes

| Mode | How | Cost |
|---|---|---|
| **Real Vapi Call** | Uses Vapi Web SDK in browser (keys in .env) | Vapi credits |
| **Phone Call** | Call the Vapi phone number from any mobile | Vapi credits |
| **Local Simulation** | Browser Web Speech API + your backend | Free |

The system auto-detects which mode to use based on your `.env` keys.

---

## 🔒 Security Features

- JWT authentication with role-based access (admin only)
- `bcryptjs` password hashing
- `helmet` HTTP security headers
- `express-rate-limit` on API + auth routes
- `cors` restricted to configured origin
- `compression` for gzip responses

---

## 📊 Admin Dashboard Features

| Page | Features |
|---|---|
| **Dashboard** | Call stats, weekly volume chart, recent enquiries |
| **College Info** | Edit courses, fees, eligibility, facilities, contact |
| **AI Agent** | Sync DB → Vapi, view assistant status, phone numbers |
| **Call History** | Search, filter call logs from Vapi webhook |
| **Automation** | Email follow-up templates and settings |
| **Settings** | Admin profile, password change |

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel (free) |
| Backend | Render / Railway (free tier) |
| Database | MongoDB Atlas (free 512MB) |
| AI Voice | Vapi (PAYG credits) |

### Deploy commands
```bash
# Build frontend for production
npm run build

# Backend: set all .env variables on Render/Railway dashboard
# Point MONGODB_URI to Atlas cluster
# Set CLIENT_URL to your Vercel frontend URL
```

---

## 📈 Future Roadmap

- [ ] WhatsApp integration (Twilio)
- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Sentiment analysis on call transcripts
- [ ] Automated follow-up email after every call
- [ ] Student lead CRM with pipeline tracking
- [ ] Multi-college SaaS (tenant isolation)
- [ ] Mobile app for admin (React Native)
- [ ] Real-time live call monitoring dashboard

---

## 👨‍💻 Development Team

Built with ❤️ using **Vapi AI + MongoDB + React + Node.js**

```
Stack: MERN + Vapi AI Voice Platform
Version: 1.0.0
Year: 2026
```
