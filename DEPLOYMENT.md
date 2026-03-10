# Deployment Guide

Production deployment options for Auto README Generator.

## Quick Deployment

### Frontend Deployment (Recommended: Vercel)

#### 1. Build the Frontend

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/`

#### 2. Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
npm install -g vercel
cd frontend
vercel deploy
```

Follow prompts and get your deployed URL.

**Option B: Using GitHub (Recommended)**

1. Push code to GitHub
2. Visit https://vercel.com
3. Click "New Project"
4. Select GitHub repository
5. Set build command: `npm run build`
6. Set output directory: `dist`
7. Click Deploy

#### 3. Update API URL (if using remote backend)

In `frontend/src/App.jsx`:
```javascript
const API_BASE_URL = 'https://your-backend-api.com'
```

---

### Backend Deployment Options

#### Option 1: Heroku (Easiest)

**Prerequisites:**
- Heroku account: https://heroku.com
- Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

**Steps:**

```bash
# Login to Heroku
heroku login

# Create app
heroku create auto-readme-generator

# Create Procfile in backend directory
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > backend/Procfile

# Create runtime.txt in backend directory
echo "python-3.11.0" > backend/runtime.txt

# Deploy
git push heroku main
```

Access your API:
```
https://auto-readme-generator.herokuapp.com/
```

#### Option 2: DigitalOcean App Platform

**Prerequisites:**
- DigitalOcean account: https://digitalocean.com
- Credit card for payment

**Steps:**

1. Create new app in DigitalOcean dashboard
2. Connect GitHub repository
3. Set environment:
   - **Language:** Python
   - **Run command:** `uvicorn main:app --host 0.0.0.0 --port 8080`
4. Deploy

#### Option 3: AWS (Lambda + API Gateway)

1. Create Lambda function
2. Upload code as ZIP
3. Set runtime to Python 3.9+
4. Create API Gateway trigger
5. Deploy

#### Option 4: Self-Hosted (Any Linux VPS)

**Prerequisites:**
- Linux VPS (Ubuntu 20.04+)
- SSH access
- Domain name (optional)

**Setup:**

```bash
# SSH into server
ssh root@your_server_ip

# Install dependencies
apt update && apt install -y python3-pip python3-venv

# Clone repository
git clone https://github.com/yourusername/auto-readme-generator.git
cd auto-readme-generator/backend

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install and run with Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

**Using systemd for auto-start:**

```bash
# Create service file
sudo nano /etc/systemd/system/readme-generator.service
```

Add:
```
[Unit]
Description=Auto README Generator API
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/home/ubuntu/auto-readme-generator/backend
Environment="PATH=/home/ubuntu/auto-readme-generator/backend/venv/bin"
ExecStart=/home/ubuntu/auto-readme-generator/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start readme-generator
sudo systemctl enable readme-generator
```

---

## Full Stack Deployment (Frontend + Backend)

### Using Docker (Recommended for Complex Setup)

**1. Create Dockerfile for Backend**

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**2. Create Docker Compose**

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:8000
```

**3. Build and Run**

```bash
docker-compose up --build
```

---

## Database Considerations (Future)

Currently, the app uses **NO database**. For future features:

### PostgreSQL Example

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:password@localhost/readme_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
```

Use cloud-hosted PostgreSQL:
- **DigitalOcean Managed Databases**
- **AWS RDS**
- **ElephantSQL** (free tier)

---

## Environment Variables

Create `.env` file in backend:

```env
# Backend
DEBUG=false
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# API Keys (for future AI features)
OPENAI_API_KEY=sk-xxxxx

# Database (if using)
DATABASE_URL=postgresql://user:pass@host/db

# Security
SECRET_KEY=your-secret-key-here
```

Access in Python:
```python
import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = os.getenv("DEBUG", "false") == "true"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
```

---

## CORS Configuration for Production

Update `backend/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

# Production CORS
if DEBUG:
    allow_origins = ["*"]
else:
    allow_origins = [
        "https://yourdomain.com",
        "https://app.yourdomain.com",
        "https://www.yourdomain.com"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Restrict methods
    allow_headers=["*"],
)
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

### Using Nginx as Reverse Proxy

```nginx
# /etc/nginx/sites-available/readme-generator

upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Performance Optimization

### Frontend

```bash
# Gzip compression
npm run build

# Enable in Vercel (automatic)
# Enable in Nginx:
gzip on;
gzip_types text/plain application/json;
gzip_min_length 1000;
```

### Backend

```python
# Add compression middleware
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add caching
from fastapi_cache2 import FastAPICache2
from fastapi_cache2.backends.redis import RedisBackend
```

### Monitor Performance

- Use Vercel Analytics (frontend)
- Use Datadog or New Relic (backend)
- Monitor API response times

---

## Monitoring & Logging

### Backend Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/generate-readme")
def generate_readme(req: ReadmeRequest):
    logger.info(f"Generating README for: {req.repo_url or 'description'}")
    # ...
```

### Error Tracking

Add Sentry for error monitoring:

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://xxx@sentry.io/xxx",
    integrations=[FastApiIntegration()],
)
```

---

## Security Checklist

- [ ] Remove `allow_origins=["*"]` in production
- [ ] Set `DEBUG = False`
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Add rate limiting (prevent abuse)
- [ ] Validate all inputs
- [ ] Use strong SECRET_KEY
- [ ] Keep dependencies updated
- [ ] Monitor error logs
- [ ] Regular backups (if using DB)

---

## CI/CD Pipeline Example (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy Frontend to Vercel
      run: |
        npm install -g vercel
        vercel deploy --prod
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    
    - name: Deploy Backend to Heroku
      run: |
        git push heroku main
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
```

---

## Post-Deployment Checklist

- [ ] Test all endpoints
- [ ] Verify CORS working
- [ ] Test on mobile
- [ ] Check API documentation at `/docs`
- [ ] Monitor error logs
- [ ] Load test with 100+ concurrent users
- [ ] Setup monitoring/alerts
- [ ] Document API endpoints for team
- [ ] Setup CDN for frontend (optional)
- [ ] Plan backup strategy

---

## Troubleshooting Deployments

### Vercel frontend shows blank page

```bash
# Check build logs in Vercel dashboard
# Rebuild if needed:
vercel deploy --prod
```

### Heroku backend returning 503

```bash
# Check logs
heroku logs --tail

# Restart dyno
heroku restart
```

### CORS errors in production

- Verify `ALLOWED_ORIGINS` includes your domain
- Ensure frontend URL matches exactly
- Check for trailing slashes

### Slow performance

- Check API response time
- Monitor server CPU/memory
- Consider caching results
- Increase server resources

---

## Cost Estimates (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0-20 | Free tier generous |
| Heroku | $7-50 | Free tier removed |
| DigitalOcean | $5-40 | Cheapest reliable option |
| AWS | $1-100+ | Pay per use |
| Custom VPS | $3-20 | Most control |

---

## Next Steps

1. Choose deployment platform
2. Set up CI/CD pipeline
3. Configure domain & SSL
4. Setup monitoring
5. Create deployment runbook
6. Train team on deployment process

For detailed help, see [DOCUMENTATION.md](../DOCUMENTATION.md)
