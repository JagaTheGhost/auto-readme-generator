# 🚀 README Studio

> **Next-generation AI documentation IDE: Generate production-ready README.md files and documentation suites automatically in seconds**

A modern full-stack developer IDE that crafts professional documentation suites, interactive diagrams, and live Markdown previews from a GitHub repository or project description.

[![Version](https://img.shields.io/badge/version-1.0.0-6366f1.svg?style=for-the-badge)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## ✨ Features

- 🔗 **Deep GitHub Inspection** - Auto-detects languages, topics, dependencies (`package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `Dockerfile`), and generates real ASCII directory trees via GitHub's Git Trees API.
- ⚡ **Quick Presets** - 1-click presets for Full-Stack SaaS, Python CLI / Libraries, React Component Libraries, and REST APIs.
- 🎨 **Multi-Theme Engine** - Choose between **Default** (detailed & polished), **Minimalist** (clean & straightforward), or **Hacker** (terminal & ASCII art aesthetic).
- 🔀 **Dynamic Section Reordering** - Drag-and-drop or toggle 11 distinct sections: Features, Tech Stack, Directory Tree, Installation, Usage, Config (`.env`), Architecture, Testing, Troubleshooting, Deployment, and Contributing.
- 🌓 **Adaptive View Modes** - Seamlessly toggle between `📝 Code Only`, `🌓 Split View`, and `👁️ Preview Only`.
- 🛠️ **Rich Markdown Editor** - Formatting toolbar with bold, italic, headings, quotes, code blocks, links, images, tables, task lists, and live document statistics (words, chars, reading time).
- 📦 **Doc Pack Generator** - Generates complete multi-file documentation suites (`README.md`, `CONTRIBUTING.md`, `LICENSE`) exported as `.zip` or standalone `.html`.
- 💾 **Local Auto-Save** - Automatically persists drafts in `localStorage` so your work is never lost.
- 🚀 **Full-Stack Vercel Deployment** - Pre-configured serverless Python backend + React frontend ready to deploy with one click.

---

## 🏗️ Project Architecture

```
auto-readme-generator/
├── api/
│   └── index.py            # Vercel serverless function entry point
├── backend/
│   ├── app.py              # FastAPI application & REST endpoints
│   ├── prompts.py          # Multi-language inference & template engine
│   ├── requirements.txt    # Python dependencies
│   ├── tests/
│   │   └── test_api.py     # Pytest test suite
│   └── Dockerfile          # Backend container image
├── frontend/
│   ├── src/
│   │   ├── components/     # React components (Input, Preview, SectionOrder, etc.)
│   │   ├── App.jsx         # Dashboard state & orchestration
│   │   └── index.css       # Design system & responsive styles
│   ├── vite.config.js      # Optimized Rollup chunking & dev proxy
│   ├── package.json        # Frontend dependencies
│   └── Dockerfile          # Frontend container image
├── .github/
│   └── workflows/ci.yml    # Automated CI pipeline
├── vercel.json             # Vercel deployment configuration
├── docker-compose.yml      # Multi-container orchestration
└── README.md               # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.9+

### 1. Local Development

**Start Backend (Terminal 1):**
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows PowerShell
# source venv/bin/activate  # macOS / Linux

pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

### 2. Docker Compose (One-Command Run)

```bash
docker compose up -d --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

---

## 🧪 Testing

Run backend unit and integration tests:

```bash
python -m pytest backend/tests/test_api.py -v
```

Run frontend production build verification:

```bash
cd frontend && npm run build
```

---

## 🌐 Deploy to Vercel

This repository is ready for full-stack deployment on Vercel:

1. Push your repository to GitHub.
2. Import it on [Vercel](https://vercel.com/new).
3. Vercel automatically detects `vercel.json` and deploys both the Vite frontend and the Python serverless function!

Alternatively, deploy using the Vercel CLI:
```bash
npm i -g vercel
vercel --prod
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
