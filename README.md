# Auto README Generator

> **Generate professional README.md files automatically in seconds** 🚀

A simple, powerful, and free web application that creates production-ready README documentation from a GitHub repository URL or project description.

## ✨ Features

- 🔗 **GitHub Integration** - Paste a repo URL or describe your project
- 🧠 **Smart Inference** - Auto-detects tech stack and project features
- 👀 **Live Preview** - See rendered markdown as you generate
- 📋 **One-Click Export** - Copy to clipboard or download as file
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Lightning Fast** - Zero database, instant generation
- 🎯 **Production-Ready** - Clean, professional output every time

## 🎯 What It Does

### Input

Choose **one or both**:
1. Paste a GitHub repository URL
2. Describe your project in plain text
3. (Optional) Select your tech stack

### Output

Get a complete README.md with:
- Project title and description
- Feature highlights
- Tech stack breakdown
- Installation instructions
- Usage guide
- Badges and license
- Screenshot section
- Plus more...

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:3000/
```

### 4. Open in Browser

Navigate to **http://localhost:3000** and start generating READMEs!

## 📊 Architecture

```
┌─────────────────────────────────────┐
│  React Frontend (Vite)              │
│  - Input Component                  │
│  - Markdown Preview                 │
│  - Export Buttons                   │
└────────────────┬────────────────────┘
                 │ API Calls
                 ↓
┌─────────────────────────────────────┐
│  FastAPI Backend                    │
│  - Input Validation                 │
│  - Smart Inference                  │
│  - Markdown Generation              │
└─────────────────────────────────────┘
```

## 📚 Project Structure

```
auto-readme-generator/
├── frontend/              # React app (Vite)
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── App.jsx        # Main app
│   │   └── index.css      # Styling
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # FastAPI application
│   ├── main.py            # API endpoints
│   ├── prompts.py         # README generation logic
│   └── requirements.txt
│
└── DOCUMENTATION.md       # Full documentation
```

## 🔌 API Reference

### Generate README

**Endpoint:** `POST /generate-readme`

**Request:**
```json
{
  "repo_url": "https://github.com/username/project",
  "description": "My project description",
  "tech_stack": ["React", "FastAPI", "MongoDB"]
}
```

**Response:**
```json
{
  "markdown": "# Project Name\n\n...",
  "metadata": {
    "project_name": "Project Name",
    "tech_stack": "React | FastAPI | MongoDB",
    "generated": true
  }
}
```

**Swagger UI:** http://localhost:8000/docs

## 💡 Example Workflow

1. **Visit** http://localhost:3000
2. **Enter** GitHub URL: `https://github.com/facebook/react`
3. **Select** tech stack: React, JavaScript, Node
4. **Click** "Generate README"
5. **See** professional markdown in real-time
6. **Copy** to clipboard or **Download** file

## 🎨 Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | React 18 + Vite | Fast, modern, minimal config |
| Styling | CSS3 | Full control, no dependencies |
| Backend | FastAPI | Modern, fast, great docs |
| HTTP | Axios | Simple, promise-based |
| Python | 3.8+ | Powerful, easy to read |

## 📁 Generated README Includes

✅ Project Title  
✅ One-line Description  
✅ 3-5 Feature Highlights  
✅ Tech Stack (Frontend/Backend/Database)  
✅ Installation Steps  
✅ Usage Instructions  
✅ Screenshot Section  
✅ Build/License/Version Badges  
✅ MIT License  

## 🧪 Testing the API

### Using curl

```bash
curl -X POST http://localhost:8000/generate-readme \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/torvalds/linux",
    "description": "The Linux kernel",
    "tech_stack": ["C", "Linux"]
  }'
```

### Health Check

```bash
curl http://localhost:8000/health
```

## 🚀 Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

Output is in `frontend/dist/` - ready to deploy!

### Deploy to Vercel

```bash
npm run build
vercel deploy
```

### Deploy Backend to Heroku

```bash
heroku create your-app-name
git push heroku main
```

## 🔒 Security & Privacy

✅ No database - nothing is stored  
✅ No login required  
✅ No API keys needed  
✅ All processing is local  
✅ Input validation on both sides  
✅ CORS configured for development  

## 📝 Future Features (v1.1+)

- 🤖 AI-powered descriptions (OpenAI API)
- 🔗 Direct GitHub API integration
- 📋 Custom template selection
- 🎨 Markdown editor in UI
- 🎯 Project type detection
- 🌐 Collaborative editing
- 📊 Usage analytics

See [DOCUMENTATION.md](DOCUMENTATION.md) for complete roadmap.

## 🐛 Troubleshooting

### Backend won't start

```bash
python --version  # Check Python 3.8+
pip install -r requirements.txt
python main.py
```

### Frontend won't connect

- Ensure backend is running on port 8000
- Check CORS is enabled in backend
- Clear browser cache

### Port already in use

```bash
# Change Vite port in vite.config.js
# or kill process on port 3000/8000
```

## 💬 Support

Need help? Check:
1. [Full Documentation](DOCUMENTATION.md)
2. Backend API docs: http://localhost:8000/docs
3. Frontend components in `src/components/`

## 📄 License

MIT License - Free to use, modify, and distribute.

## 🙏 Credits

Built with:
- React 18
- FastAPI
- Vite
- Axios
- Pure CSS3

---

**Ready to generate some READMEs?** 🎉

```bash
npm run dev  # Frontend
python main.py  # Backend
```

Then visit http://localhost:3000
