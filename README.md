# 🎵 Gen Audius Pro — V1.0.0 (Official Launch)

> **The Ultimate AI Music Production SaaS & Artist Hub**
> *Dark Luxury Edition — Production ready, secure, and scalable.*

---

## 🏗️ Architecture Overview

```text
gen-audius-pro/
├── frontend/                  # React + Vite (V1.0 Luxury UI)
│   └── src/
│       ├── components/        # V3 Components (Creator, DAW, Admin, Profile)
│       ├── context/           # Sync Providers (DB, Wallet, API Keys)
│       ├── services/          # aiService, ProviderEngine, Social APIs
│       └── i18n/              # Multi-language (ES/EN/PT/FR)
│
├── backend/                   # FastAPI Python Engine
│   ├── main.py                # API Gateway + Security Middleware
│   ├── database.py            # SQL (Postgres/SQLite) + NoSQL (MongoDB)
│   ├── Dockerfile             # Production Containerization
│   └── services/music/
│       ├── kie_suno_adapter.py     # KIE.AI → Suno Engine
│       └── mastering_adapter.py   # Masterchannel AI Mastering
│
└── deploy/                    # GCP & Vercel deployment configs
```

### Advanced Data Flow
Gen Audius Pro uses a dual-persistence layer to ensure financial integrity and high-performance logging:
- **PostgreSQL**: Handles User Accounts, Wallets, Roles, Blog Posts, and Security Logs.
- **MongoDB**: Handles high-volume audio metadata, live hit logs, and transient session data.

---

## 🔑 Key Features (V1.0)

| Feature | Description |
|---|---|
| 🎵 **AI Music Generation** | Multi-engine support (Suno, Kie, Mureka) for high-fidelity music. |
| 🎚️ **AI Mastering** | Professional cloud mastering via Masterchannel with target LUFS. |
| 🛡️ **Advanced Security** | Anti-fraud monitoring, IP burst protection, and security incident logging. |
| 📰 **Blog System** | Built-in CMS for promoting news, tutorials, and system updates. |
| 📧 **System Emails** | Full SMTP integration for account verification, notifications, and resets. |
| 👤 **Artist Profiles** | Role-based profiles: DJ, Musician, Producer, Broadcaster, Indie Artist. |
| 🌐 **Social Connect** | Native API integrations for **Spotify Artist API** and **Last.fm Scrobbling**. |
| 🎛️ **Studio DAW** | Desktop-grade production environment with OpenDAW SDK. |

---

## 🚀 Quick Start (V1.0.0)

### 1. Local Environment Setup

```bash
# Clone the official V1 repository
git clone https://github.com/genaudius/gen-audius-pro.git
cd gen-audius-pro

# Install Frontend (Vite + React)
cd frontend && npm install

# Install Backend (FastAPI)
cd ../backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Variables (.env)
Create a `.env` in the `backend/` folder:
```env
DATABASE_URL=sqlite:///./gen_audius_dev.db  # Or PostgreSQL for Prod
MONGO_URL=mongodb://localhost:27017        # Optional
KIE_API_KEY=your_key_here
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Execution
```bash
# Backend
uvicorn main:app --reload

# Frontend
npm run dev
```

---

## 🔌 API Reference (V1.0)

### Auth & User
- `POST /api/auth/login`: Authenticate and start session.
- `GET /api/auth/verify`: Verify email through token.
- `GET /api/user/wallet`: Live balance and credit status.

### Content & Admin
- `GET /api/blog`: Public news feed.
- `POST /api/admin/blog`: Create new blog entries (Admin only).
- `POST /api/security/report`: Log and detect suspicious activities.
- `POST /api/admin/email-config`: Set SMTP credentials.

### Music & AI
- `POST /api/music/generate`: Create songs (5 credits).
- `POST /api/music/master`: Professional mastering (3 credits).

---

## 🏰 Deployment (GCP Ready)

Gen Audius Pro V1.0 is optimized for **Google Cloud Platform**:

- **Backend**: Containerized via Docker, hosted on Compute Engine (`gen-audius-prod`).
- **Database**: PostgreSQL (Cloud SQL) + MongoDB (Cloud Atlas).
- **Domains**: 
  - Backend: `studio.genaudius.com`
  - Frontend: `genaudius.com` (Vercel)

---

## 🎨 Design Aesthetics (V1.0)
The **Dark Luxury Design System** uses a custom-curated palette:
- `C.a` (Neon Blue): `#00E5FF`
- `C.gold` (Luxury Bronze): `#D4AF37`
- `C.bg`: `#030816` (Deep Space)

Animations powered by **Framer Motion** for a premium "Apple-like" feel.

---

*© 2026 Gen Audius LLC. Built with ❤️ for the world of AI Music.*