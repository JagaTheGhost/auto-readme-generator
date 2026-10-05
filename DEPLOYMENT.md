# 🚀 Deployment Guide

Deploy **Auto README Generator** as a full-stack application.

---

## ⚡ Recommended: Full-Stack Vercel Deployment (Zero-Config)

Thanks to `vercel.json` and `/api/index.py`, both the **React frontend** and the **FastAPI backend** deploy together seamlessly as a unified application on **Vercel**.

### Deploy via GitHub (1-Click)

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your GitHub repository: `auto-readme-generator`.
4. Vercel automatically detects the root configuration:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
5. Click **Deploy**.

Your API endpoints will be accessible at:
- `https://your-domain.vercel.app/api/generate-readme`
- `https://your-domain.vercel.app/api/health`

### Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Deploy from the root of this project
vercel

# 3. For production release
vercel --prod
```

---

## 🐳 Option 2: Docker Compose (Self-Hosted / VPS)

For deploying to AWS EC2, DigitalOcean, or your own server:

```bash
# Clone the repository
git clone https://github.com/your-username/auto-readme-generator.git
cd auto-readme-generator

# Start both frontend and backend
docker compose up -d --build
```

- **Frontend:** http://localhost:3000
- **Backend API & Swagger Docs:** http://localhost:8000/docs

---

## 💻 Local Development Setup

### 1. Start Backend Server
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows PowerShell / CMD
# source venv/bin/activate  # macOS / Linux

pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### 2. Start Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 🧪 Testing

Run backend automated tests anytime:

```bash
python -m pytest backend/tests/test_api.py -v
```
