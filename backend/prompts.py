"""
Prompt templates for README generation
"""

README_TEMPLATE = """# {project_name}

{description}

## ✨ Features

{features}

## 🏗️ Project Structure

```
.
├── frontend/          # React/Next.js application
├── backend/           # API server
├── docs/              # Documentation
└── README.md          # You are here
```

## 📚 Tech Stack

{tech_stack}

## 🚀 Getting Started

### Prerequisites

{prerequisites}

### Installation

```bash
# Clone the repository
git clone {clone_url}
cd {project_name_slug}

# Install dependencies
{installation_steps}
```

### Running Locally

```bash
{usage_instructions}
```

## 📖 Usage

{detailed_usage}

## 🔧 Configuration

Create a `.env` file in the project root with the following variables:

```env
# Add your environment variables here
NODE_ENV=development
DEBUG=true
```

## 📁 Project Architecture

{architecture}

## 🧪 Testing

```bash
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🐛 Troubleshooting

### Common Issues

**Issue:** Port already in use
```bash
# Kill the process using the port
lsof -ti:3000 | xargs kill -9
```

**Issue:** Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deployment

{deployment_guide}

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with passion and dedication
- Inspired by best practices in software development
- Thanks to all contributors

## 📞 Contact

For questions or feedback, please open an issue or reach out on GitHub.

---

<div align="center">

{badges}

Made with ❤️ by the development team

</div>"""


def build_readme_from_inputs(
    repo_url: str = None,
    description: str = None,
    tech_stack_items: list = None,
) -> dict:
    """
    Build a README from user inputs and infer missing information.
    
    Args:
        repo_url: GitHub repository URL
        description: Project description
        tech_stack_items: List of selected tech stack items
    
    Returns:
        Dictionary containing inferred information
    """
    
    project_name = "My Awesome Project"
    project_name_slug = "my-awesome-project"
    clone_url = "https://github.com/username/repo.git"
    short_description = "A modern, production-ready project built with the latest technologies."
    
    # Extract from repo URL if provided
    if repo_url:
        parts = repo_url.rstrip("/").split("/")
        if len(parts) >= 2:
            project_name = parts[-1].replace("-", " ").title()
            project_name_slug = parts[-1]
            clone_url = repo_url.rstrip("/") + ".git"
            short_description = f"A comprehensive solution built for {parts[-1]}."
    
    # Use provided description or fallback
    if description:
        short_description = description[:300]
    
    # Build all components
    features = _infer_features(repo_url, description, tech_stack_items)
    tech_stack = _infer_tech_stack(tech_stack_items)
    installation_steps = _infer_installation(tech_stack_items)
    usage_instructions = _infer_usage(tech_stack_items)
    detailed_usage = _infer_detailed_usage(tech_stack_items)
    architecture = _infer_architecture(tech_stack_items)
    deployment_guide = _infer_deployment(tech_stack_items)
    badges = _build_badges(project_name_slug)
    prerequisites = _infer_prerequisites(tech_stack_items)
    
    return {
        "project_name": project_name,
        "project_name_slug": project_name_slug,
        "description": short_description,
        "features": features,
        "tech_stack": tech_stack,
        "clone_url": clone_url,
        "installation_steps": installation_steps,
        "usage_instructions": usage_instructions,
        "detailed_usage": detailed_usage,
        "architecture": architecture,
        "deployment_guide": deployment_guide,
        "badges": badges,
        "prerequisites": prerequisites,
    }


def _infer_features(repo_url: str, description: str, tech_stack_items: list) -> str:
    """Infer features from inputs."""
    features = [
        "✅ Production-ready codebase",
        "⚡ High performance and scalability",
        "🎨 Beautiful, responsive design",
    ]
    
    if description:
        if "api" in description.lower():
            features.append("🔌 RESTful API with comprehensive documentation")
        if "real-time" in description.lower() or "realtime" in description.lower():
            features.append("🔄 Real-time updates and synchronization")
        if "mobile" in description.lower():
            features.append("📱 Mobile-optimized interface")
        if "secure" in description.lower():
            features.append("🔐 Security-first implementation")
    
    if tech_stack_items:
        if "React" in tech_stack_items or "Next.js" in tech_stack_items:
            features.insert(0, "⚛️ Modern React architecture with hooks")
        if "MongoDB" in tech_stack_items or "PostgreSQL" in tech_stack_items:
            features.insert(1, "💾 Robust data persistence")
        if "Docker" in tech_stack_items:
            features.append("🐳 Docker containerization support")
        if "GitHub Actions" in tech_stack_items or "Jenkins" in tech_stack_items:
            features.append("🔄 Automated CI/CD pipeline")
    
    return "\n".join([f"- {f}" for f in features])


def _infer_tech_stack(tech_stack_items: list) -> str:
    """Infer tech stack from selected items."""
    if tech_stack_items is None:
        tech_stack_items = []
    
    frontend_techs = [t for t in tech_stack_items if t in 
        ["React", "Next.js", "Vue", "Angular", "Svelte", "Remix", "TypeScript", "Tailwind CSS", "Vite", "Webpack"]]
    backend_techs = [t for t in tech_stack_items if t in 
        ["Node.js", "FastAPI", "Flask", "Django", "Go", "Rust", "Java/Spring", ".NET/C#", "Python", "PHP/Laravel"]]
    database_techs = [t for t in tech_stack_items if t in 
        ["MongoDB", "MySQL", "PostgreSQL", "SQLite", "Redis", "DynamoDB", "Firestore", "Elasticsearch"]]
    devops_techs = [t for t in tech_stack_items if t in 
        ["Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "Vercel", "Netlify", "Heroku", "GitHub Actions", "Jenkins"]]
    testing_techs = [t for t in tech_stack_items if t in 
        ["Jest", "Pytest", "Cypress", "Postman"]]
    
    tech_stack_str = ""
    
    if frontend_techs:
        tech_stack_str += f"**Frontend:**\n{' • '.join(frontend_techs)}\n\n"
    if backend_techs:
        tech_stack_str += f"**Backend:**\n{' • '.join(backend_techs)}\n\n"
    if database_techs:
        tech_stack_str += f"**Database:**\n{' • '.join(database_techs)}\n\n"
    if devops_techs:
        tech_stack_str += f"**DevOps & Deployment:**\n{' • '.join(devops_techs)}\n\n"
    if testing_techs:
        tech_stack_str += f"**Testing:**\n{' • '.join(testing_techs)}\n"
    
    if not tech_stack_str:
        tech_stack_str = """**Frontend:**
React • Next.js • TypeScript • Tailwind CSS

**Backend:**
Node.js • FastAPI • Python

**Database:**
PostgreSQL • Redis

**DevOps:**
Docker • GitHub Actions"""
    
    return tech_stack_str.strip()


def _infer_installation(tech_stack_items: list) -> str:
    """Infer installation steps from tech stack."""
    if tech_stack_items is None:
        tech_stack_items = []
    
    steps = []
    
    if any(t in tech_stack_items for t in ["React", "Next.js", "Vue", "Angular", "Node.js"]):
        steps.append("npm install")
    
    if any(t in tech_stack_items for t in ["FastAPI", "Flask", "Django", "Python"]):
        steps.append("pip install -r requirements.txt")
    
    if not steps:
        steps = ["npm install", "pip install -r requirements.txt"]
    
    return "\n".join(steps)


def _infer_usage(tech_stack_items: list) -> str:
    """Infer usage instructions from tech stack."""
    if tech_stack_items is None:
        tech_stack_items = []
    
    if any(t in tech_stack_items for t in ["FastAPI", "Flask", "Django"]):
        return """# Terminal 1: Start backend
python main.py

# Terminal 2: Start frontend
npm run dev"""
    
    return """# Start development server
npm run dev

# Open browser and navigate to
http://localhost:3000"""


def _infer_detailed_usage(tech_stack_items: list) -> str:
    """Infer detailed usage instructions."""
    if tech_stack_items is None:
        tech_stack_items = []
    
    usage = """### Basic Workflow

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open the application**
   Navigate to http://localhost:3000 in your browser

3. **Make changes**
   Edit files and see hot reload in action"""
    
    if any(t in tech_stack_items for t in ["React", "Next.js"]):
        usage += """

### Component Development

- Components are located in `src/components/`
- Use functional components with hooks
- Follow the component naming conventions"""
    
    if any(t in tech_stack_items for t in ["FastAPI", "Flask", "Django"]):
        usage += """

### API Development

- API routes are defined in the backend
- Use the provided endpoints via HTTP requests
- Document all endpoints with clear examples"""
    
    return usage


def _infer_architecture(tech_stack_items: list) -> str:
    """Infer project architecture."""
    if tech_stack_items is None:
        tech_stack_items = []
    
    architecture = """### Layer Structure

**Presentation Layer:** User interface components and views
**Business Logic Layer:** Core application logic
**Data Access Layer:** Database operations and queries
**API Layer:** RESTful endpoints and data serialization"""
    
    if any(t in tech_stack_items for t in ["React", "Next.js", "Vue"]):
        architecture += """

### Frontend Architecture

- Component-based structure
- State management with hooks/store
- API integration layer
- Responsive design system"""
    
    if any(t in tech_stack_items for t in ["FastAPI", "Flask", "Django"]):
        architecture += """

### Backend Architecture

- Modular endpoint definitions
- Request validation and serialization
- Database models and queries
- Authentication and authorization"""
    
    return architecture


def _infer_deployment(tech_stack_items: list) -> str:
    """Infer deployment guide."""
    if tech_stack_items is None:
        tech_stack_items = []
    
    deployment = "### Deployment Options\n\n"
    
    if any(t in tech_stack_items for t in ["Vercel", "Netlify"]):
        deployment += "**Vercel/Netlify:**\n1. Connect GitHub repository\n2. Configure build settings\n3. Deploy with one click\n\n"
    
    if any(t in tech_stack_items for t in ["Heroku"]):
        deployment += "**Heroku:**\n1. Create Procfile\n2. Add environment variables\n3. Deploy using Heroku CLI\n\n"
    
    if any(t in tech_stack_items for t in ["Docker"]):
        deployment += "**Docker:**\n```bash\ndocker build -t app .\ndocker run -p 3000:3000 app\n```\n\n"
    
    if any(t in tech_stack_items for t in ["AWS", "Google Cloud", "Azure"]):
        deployment += f"**Cloud Platform:**\nUse {next((t for t in ['AWS', 'Google Cloud', 'Azure'] if t in tech_stack_items), 'cloud services')} for scalable deployment\n\n"
    
    if not deployment.endswith("\n\n"):
        deployment = """### Deployment Steps

1. **Prepare for production**
   - Set environment variables
   - Build optimized bundles
   - Run tests

2. **Deploy**
   - Choose deployment platform
   - Configure CI/CD pipeline
   - Monitor application

3. **Post-deployment**
   - Verify functionality
   - Set up monitoring
   - Enable error tracking"""
    
    return deployment.strip()


def _build_badges(project_slug: str) -> str:
    """Build badge markdown."""
    return f"""![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Version](https://img.shields.io/badge/version-1.0.0-orange?style=flat-square)
![Status](https://img.shields.io/badge/status-active-success?style=flat-square)"""


def _infer_prerequisites(tech_stack_items: list) -> str:
    """Infer prerequisites from tech stack."""
    if tech_stack_items is None:
        tech_stack_items = []
    
    prerequisites = []
    
    if any(t in tech_stack_items for t in ["React", "Next.js", "Vue", "Angular", "Node.js", "Vite", "Webpack"]):
        prerequisites.append("Node.js 16.0+ and npm 8.0+")
    
    if any(t in tech_stack_items for t in ["FastAPI", "Flask", "Django", "Python"]):
        prerequisites.append("Python 3.8+")
    
    if any(t in tech_stack_items for t in ["MongoDB"]):
        prerequisites.append("MongoDB 4.0+")
    elif any(t in tech_stack_items for t in ["MySQL"]):
        prerequisites.append("MySQL 8.0+")
    elif any(t in tech_stack_items for t in ["PostgreSQL"]):
        prerequisites.append("PostgreSQL 12+")
    
    if any(t in tech_stack_items for t in ["Docker"]):
        prerequisites.append("Docker & Docker Compose")
    
    if not prerequisites:
        prerequisites = ["Node.js 16.0+", "Python 3.8+", "Git 2.0+"]
    
    return " | ".join(prerequisites)
