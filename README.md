# 🎓 College AI Voice Agent

> **An AI-powered voice agent platform for colleges to automate student admissions enquiries using real-time voice calls, database-driven responses, admission lead capture, and a full admin dashboard.**

---

## 📌 Project Overview

Students often wait long for basic admission information. This system replaces the phone-based enquiry queue with an **AI Voice Agent** that:

- Answers 24/7 on phone and web
- Uses live college data from MongoDB (courses, fees, hostel, contact)
- Runs an **admission lead flow**: asks name, age, 12th%, course, city when callers say "admission"
- Saves admission leads to the admin dashboard
- Sends SMS follow-up after calls
- Logs every call for admin review

### Core Flow

```
Student calls / uses web voice
        ↓
Vapi AI Voice Agent answers
        ↓
Dynamic prompt from MongoDB (via webhook or synced assistant)
        ↓
If "admission" → asks: name, age, 12th%, course, city
        ↓
Lead saved to DB (from transcript) + optional SMS sent
        ↓
Admin sees leads in Admission Leads page
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS |
| **UI** | Lucide Icons, react-hot-toast |
| **Routing** | React Router v6 |
| **HTTP** | Axios |
| **Backend** | Node.js, Express |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Auth** | JWT + bcryptjs |
| **AI Voice** | Vapi AI (Web SDK, Phone, Management API) |
| **AI Model** | OpenAI GPT-3.5-turbo (via Vapi) |
| **RAG** | Custom chunking + embeddings (OpenAI) |
| **SMS** | Twilio |
| **Email** | Nodemailer (optional) |
| **Logging** | Winston, Morgan |
| **Security** | Helmet, CORS, express-rate-limit, compression |
| **Deployment** | Vercel (full-stack) |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                           │
│  Public: Home / About / Courses / Facilities / Admissions                 │
│  Admin: Dashboard / College Info / AI Agent / Knowledge / Call History   │
│         Admission Leads / Automation / Settings                          │
│  Voice: Browser AI call (Vapi Web SDK)                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP → /api
┌────────────────────────────────▼────────────────────────────────────────┐
│                        BACKEND (Node.js + Express)                        │
│  /api/auth      → Login, register                                        │
│  /api/college   → College info CRUD                                      │
│  /api/agent     → Agent config (prompt, first message, etc.)             │
│  /api/calls     → Call history                                           │
│  /api/leads     → Admission leads (admin)                                │
│  /api/vapi      → Sync assistant to Vapi, list phone numbers             │
│  /api/webhook   → Vapi events: assistant-request, end-of-call-report     │
│  /api/knowledge → RAG documents CRUD                                     │
│  /api/ai        → Local AI fallback (keyword engine)                     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ Mongoose
┌────────────────────────────────▼────────────────────────────────────────┐
│                         MongoDB Atlas                                    │
│  users | collegeinfos | agentconfigs | calllogs | admissionleads         │
│  messagetemplates | knowledgedocuments                                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                         Vapi AI Platform                                 │
│  Phone → Server URL (webhook) OR Assistant ID (synced)                   │
│  GPT-3.5-turbo, Cartesia voice                                           │
│  Webhook: assistant-request → returns dynamic prompt + admission flow    │
│           end-of-call-report → log call, extract lead, send SMS          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
major project/
├── package.json              ← Root: concurrently runs frontend + backend
├── vercel.json               ← Vercel: API routes + SPA
├── api/
│   └── [[...path]].js        ← Vercel serverless API handler
│
├── frontend/
│   ├── vite.config.js        ← Proxy /api → backend
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx           ← Router, public/admin layouts
│       ├── api/index.js      ← Axios API client
│       ├── components/       ← Navbar, Footer, VoiceCallModal, ProtectedRoute
│       ├── layouts/          ← AdminLayout
│       └── pages/
│           ├── Landing.jsx, Home.jsx, About.jsx, Courses.jsx, etc.
│           └── admin/
│               ├── Login.jsx, DashboardHome.jsx
│               ├── CollegeInfo.jsx, AgentControl.jsx
│               ├── Knowledge.jsx       ← RAG documents
│               ├── CallHistory.jsx
│               ├── AdmissionLeads.jsx  ← Admission leads table
│               ├── Automation.jsx, Settings.jsx
│               └── LiveMonitor.jsx
│
├── backend/
│   ├── server.js             ← Express server (local)
│   ├── app.js                ← Express app (used by server + Vercel)
│   ├── seed.js               ← Admin user + sample college data
│   ├── models/
│   │   ├── User.js
│   │   ├── CollegeInfo.js
│   │   ├── AgentConfig.js
│   │   ├── CallLog.js
│   │   ├── AdmissionLead.js
│   │   ├── MessageTemplate.js
│   │   └── KnowledgeDocument.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── college.js
│   │   ├── agent.js
│   │   ├── calls.js
│   │   ├── leads.js          ← GET admission leads (admin)
│   │   ├── webhook.js        ← Vapi: assistant-request, end-of-call-report
│   │   ├── vapi.js
│   │   ├── knowledge.js
│   │   ├── templates.js
│   │   └── ai.js
│   ├── middleware/
│   │   └── auth.js           ← JWT protect, adminOnly
│   └── utils/
│       ├── vapiSync.js       ← Build prompt, PATCH Vapi assistant
│       ├── promptEnricher.js ← Live notices + RAG chunks
│       ├── rag.js            ← RAG retrieval
│       ├── liveDataFetcher.js
│       ├── sms.js            ← Twilio SMS
│       ├── email.js
│       └── logger.js
│
├── VAPI_SETUP.md             ← Server URL vs Assistant ID
└── DEPLOY.md                 ← Vercel deployment steps
```

---

## 🔄 How It Works

### 1. Voice Call Flow

| Step | Event | What Happens |
|------|-------|--------------|
| 1 | Caller dials / uses web voice | Vapi answers |
| 2 | **If Server URL set** | Vapi sends `assistant-request` to your webhook |
| 3 | Webhook response | Backend returns full assistant (prompt + admission flow) |
| 4 | **If Assistant ID set** | Vapi uses synced assistant (no webhook for assistant) |
| 5 | Caller says "admission" | AI asks: name → age → 12th% → course → city |
| 6 | Call ends | Vapi sends `end-of-call-report` to webhook |
| 7 | Webhook | Logs call, extracts lead from transcript, sends SMS |

### 2. Admission Lead Capture

- **During call**: AI follows a prompt-only flow (asks 5 questions one by one)
- **After call**: Webhook receives `end-of-call-report` with transcript
- **Extraction**: Parses user messages for name, age, 12th%, course, city
- **Save**: Writes to `AdmissionLead` collection
- **Admin**: View in **Admin → Admission Leads**, search, export CSV

### 3. Two Modes: Server URL vs Assistant ID

| Mode | Config | When assistant-request is used | Admission flow |
|------|--------|-------------------------------|----------------|
| **Server URL** | Phone number → Server URL, no Assistant | Yes (every call) | Dynamic prompt from webhook ✅ |
| **Assistant ID** | Phone number → Assistant | No | Synced prompt only (from Sync Now) |

**Recommended**: Use **Server URL** on the phone number so every call gets the dynamic admission flow. See `VAPI_SETUP.md`.

### 4. Data Flow (Sync vs Webhook)

```
Sync (Admin → "Sync Now"):
  MongoDB → vapiSync.js → PATCH Vapi assistant

Webhook (Server URL set):
  Call starts → assistant-request → webhook returns assistant
  Call ends   → end-of-call-report → webhook logs + extracts lead + SMS
```

---

## ⚙️ Environment Variables

### `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret

VAPI_PUBLIC_KEY=...
VAPI_PRIVATE_KEY=...
VAPI_ASSISTANT_ID=...

OPENAI_API_KEY=sk-...

# Optional
CLIENT_URL=http://localhost:5173
WEBSITE_URL=bcetodisha.ac.in

# SMS (Twilio)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Email (optional)
SMTP_USER=...
SMTP_PASS=...
```

### `frontend/.env`

```env
VITE_VAPI_PUBLIC_KEY=...
VITE_VAPI_ASSISTANT_ID=...
VITE_API_URL=http://localhost:5000
```

On Vercel, omit `VITE_API_URL` — frontend and API share the same origin.

---

## 🚀 Quick Start

```bash
# 1. Install
cd "major project"
npm run install:all

# 2. Configure backend/.env and frontend/.env

# 3. Seed DB (admin user + sample college)
npm run seed

# 4. Run dev servers
npm run dev
```

- **Frontend**: http://localhost:5173  
- **API**: http://localhost:5000  
- **Admin**: http://localhost:5173/admin/login  

**Default admin**: `admin@college.com` / `admin123`

---

## 📞 Vapi Setup

1. Get a phone number at [dashboard.vapi.ai](https://dashboard.vapi.ai)
2. **For admission flow + lead capture**: Set **Server URL** on the phone number to  
   `https://your-app.vercel.app/api/webhook/vapi`  
   and **do not** assign an Assistant
3. **Or** use Assistant ID and click **Sync Now** in Admin → AI Agent (simpler, no dynamic webhook)

See **VAPI_SETUP.md** for details.

---

## 📊 Admin Dashboard

| Page | Features |
|------|----------|
| **Overview** | Stats, charts |
| **College Info** | Courses, fees, facilities, contact |
| **AI Agent** | Sync DB → Vapi, first message, system prompt |
| **Knowledge** | RAG documents (chunking, indexing) |
| **Call History** | Search, filter call logs |
| **Admission Leads** | View, search, export CSV |
| **Automation** | Templates, settings |
| **Settings** | Profile, password |

---

## 🌐 Deployment (Vercel)

Full-stack deploy: frontend + API on one Vercel project.

```bash
npm run build
```

Add env vars in Vercel, then deploy. See **DEPLOY.md** for steps.

| Component | Host |
|-----------|------|
| Frontend + API | Vercel |
| MongoDB | Atlas |
| Voice | Vapi |

---

## 📄 Related Docs

- **VAPI_SETUP.md** — Server URL vs Assistant, admission flow
- **DEPLOY.md** — Vercel deployment

---

```
Stack: MERN + Vapi AI
Version: 1.0
Year: 2026
```
