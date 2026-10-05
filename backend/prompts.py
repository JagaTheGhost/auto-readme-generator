"""
Prompt templates and inference engine for README generation.
Supports multi-language GitHub repo analysis, directory tree extraction,
custom themes (default, minimalist, hacker), and dynamic section ordering.
"""
import os
import re
import datetime
import httpx

# Available section identifiers and their default labels
ALL_SECTIONS = [
    {"id": "features", "label": "Features"},
    {"id": "tech_stack", "label": "Tech Stack"},
    {"id": "project_structure", "label": "Project Structure"},
    {"id": "installation", "label": "Installation & Setup"},
    {"id": "usage", "label": "Usage Guide"},
    {"id": "configuration", "label": "Environment & Config"},
    {"id": "architecture", "label": "Architecture"},
    {"id": "testing", "label": "Testing"},
    {"id": "troubleshooting", "label": "Troubleshooting"},
    {"id": "deployment", "label": "Deployment"},
    {"id": "contributing", "label": "Contributing & License"},
]

DEFAULT_SECTION_IDS = [s["id"] for s in ALL_SECTIONS]


def extract_owner_repo(url: str):
    """Extract owner and repo name from GitHub URL."""
    if not url:
        return None, None
    m = re.search(r"github\.com/([a-zA-Z0-9_\-\.]+)/([a-zA-Z0-9_\-\.]+)", url)
    if not m:
        return None, None
    owner = m.group(1).strip()
    repo = m.group(2).rstrip("/").strip()
    if repo.endswith(".git"):
        repo = repo[:-4]
    return owner, repo


def _fetch_file_content(client: httpx.Client, owner: str, repo: str, branch: str, file_path: str) -> str:
    """Fetch raw file content from GitHub usercontent."""
    try:
        url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{file_path}"
        resp = client.get(url, timeout=3.0)
        if resp.status_code == 200:
            return resp.text
    except Exception:
        pass
    return ""


def _build_tree_from_git_tree(tree_items: list, max_depth: int = 2) -> str:
    """Construct a clean ASCII directory tree from GitHub tree API items."""
    filtered_paths = []
    ignored_prefixes = (
        ".git", "node_modules", "__pycache__", ".venv", "venv",
        "dist", "build", ".next", ".turbo", ".idea", ".vscode"
    )

    for item in tree_items:
        path = item.get("path", "")
        parts = path.split("/")
        if any(part in ignored_prefixes for part in parts):
            continue
        if len(parts) <= max_depth:
            filtered_paths.append(path)

    if not filtered_paths:
        return ""

    # Sort paths so directories and files group neatly
    filtered_paths.sort()

    lines = ["."]
    tree_dict = {}
    for p in filtered_paths:
        parts = p.split("/")
        curr = tree_dict
        for part in parts:
            curr = curr.setdefault(part, {})

    def recurse(d, prefix=""):
        keys = list(d.keys())
        for idx, key in enumerate(keys):
            is_last = (idx == len(keys) - 1)
            connector = "└── " if is_last else "├── "
            lines.append(f"{prefix}{connector}{key}")
            next_prefix = prefix + ("    " if is_last else "│   ")
            recurse(d[key], next_prefix)

    recurse(tree_dict)
    return "\n".join(lines[:25])  # Limit to 25 rows for clean display


def fetch_github_repo_metadata(repo_url: str) -> dict:
    """Fetch live metadata, topics, languages, tree, and build scripts from GitHub."""
    owner, repo = extract_owner_repo(repo_url)
    if not owner or not repo:
        return {}

    headers = {
        "User-Agent": "Auto-README-Generator/2.0",
        "Accept": "application/vnd.github.v3+json",
    }
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"token {github_token}"

    data = {
        "owner": owner,
        "repo": repo,
        "full_name": f"{owner}/{repo}",
        "name": repo.replace("-", " ").replace("_", " ").title(),
        "slug": repo,
        "clone_url": f"https://github.com/{owner}/{repo}.git",
        "stars": 0,
        "forks": 0,
        "license": "MIT",
        "topics": [],
        "language": None,
        "detected_tech": [],
        "custom_install": None,
        "custom_usage": None,
        "custom_test": None,
        "directory_tree": None,
        "rate_limited": False,
    }

    try:
        with httpx.Client(headers=headers, follow_redirects=True) as client:
            resp = client.get(f"https://api.github.com/repos/{owner}/{repo}", timeout=4.0)

            if resp.status_code == 403:
                data["rate_limited"] = True
                return data

            if resp.status_code == 200:
                repo_info = resp.json()
                data["name"] = repo_info.get("name", repo).replace("-", " ").replace("_", " ").title()
                data["slug"] = repo_info.get("name", repo)
                data["description"] = repo_info.get("description") or ""
                data["stars"] = repo_info.get("stargazers_count", 0)
                data["forks"] = repo_info.get("forks_count", 0)
                data["default_branch"] = repo_info.get("default_branch", "main")
                data["topics"] = repo_info.get("topics", [])
                data["language"] = repo_info.get("language")
                if repo_info.get("license"):
                    data["license"] = repo_info["license"].get("spdx_id") or repo_info["license"].get("name") or "MIT"

                branch = data.get("default_branch", "main")

                # 1. Fetch Languages API
                try:
                    lang_resp = client.get(f"https://api.github.com/repos/{owner}/{repo}/languages", timeout=3.0)
                    if lang_resp.status_code == 200:
                        for lang in list(lang_resp.json().keys()):
                            if lang not in data["detected_tech"]:
                                data["detected_tech"].append(lang)
                except Exception:
                    pass

                # 2. Check package.json (Node/JS/TS ecosystem)
                pkg_text = _fetch_file_content(client, owner, repo, branch, "package.json")
                if pkg_text:
                    try:
                        import json
                        pkg_data = json.loads(pkg_text)
                        deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
                        scripts = pkg_data.get("scripts", {})

                        tech_maps = {
                            "react": "React",
                            "next": "Next.js",
                            "vue": "Vue",
                            "nuxt": "Nuxt.js",
                            "svelte": "Svelte",
                            "vite": "Vite",
                            "tailwindcss": "Tailwind CSS",
                            "typescript": "TypeScript",
                            "express": "Node.js",
                            "fastify": "Node.js",
                            "jest": "Jest",
                            "vitest": "Vitest",
                            "cypress": "Cypress",
                            "playwright": "Playwright",
                        }
                        for pkg_name, tech_label in tech_maps.items():
                            if pkg_name in deps and tech_label not in data["detected_tech"]:
                                data["detected_tech"].append(tech_label)

                        data["custom_install"] = "npm install"
                        if "dev" in scripts:
                            data["custom_usage"] = "npm run dev"
                        elif "start" in scripts:
                            data["custom_usage"] = "npm start"

                        if "test" in scripts:
                            data["custom_test"] = "npm test"
                    except Exception:
                        pass

                # 3. Check Python requirements / pyproject.toml
                req_text = _fetch_file_content(client, owner, repo, branch, "requirements.txt")
                pyproj_text = _fetch_file_content(client, owner, repo, branch, "pyproject.toml")
                combined_py = (req_text + "\n" + pyproj_text).lower()

                if combined_py.strip():
                    if "Python" not in data["detected_tech"]:
                        data["detected_tech"].append("Python")
                    data["custom_install"] = "pip install -r requirements.txt"
                    data["custom_usage"] = "python main.py"
                    data["custom_test"] = "pytest"

                    py_maps = {
                        "fastapi": "FastAPI",
                        "flask": "Flask",
                        "django": "Django",
                        "pytest": "Pytest",
                        "torch": "PyTorch",
                        "tensorflow": "TensorFlow",
                        "pandas": "Pandas",
                        "numpy": "NumPy",
                        "pydantic": "FastAPI",
                    }
                    for kw, label in py_maps.items():
                        if kw in combined_py and label not in data["detected_tech"]:
                            data["detected_tech"].append(label)

                # 4. Check Rust (Cargo.toml)
                cargo_text = _fetch_file_content(client, owner, repo, branch, "Cargo.toml")
                if cargo_text:
                    if "Rust" not in data["detected_tech"]:
                        data["detected_tech"].append("Rust")
                    data["custom_install"] = "cargo build"
                    data["custom_usage"] = "cargo run"
                    data["custom_test"] = "cargo test"

                # 5. Check Go (go.mod)
                gomod_text = _fetch_file_content(client, owner, repo, branch, "go.mod")
                if gomod_text:
                    if "Go" not in data["detected_tech"]:
                        data["detected_tech"].append("Go")
                    data["custom_install"] = "go mod download"
                    data["custom_usage"] = "go run main.go"
                    data["custom_test"] = "go test ./..."

                # 6. Check Dockerfile & docker-compose
                docker_text = _fetch_file_content(client, owner, repo, branch, "Dockerfile")
                compose_text = _fetch_file_content(client, owner, repo, branch, "docker-compose.yml")
                if (docker_text or compose_text) and "Docker" not in data["detected_tech"]:
                    data["detected_tech"].append("Docker")

                # 7. Fetch Git Tree for ASCII project structure
                try:
                    tree_resp = client.get(
                        f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1",
                        timeout=3.5
                    )
                    if tree_resp.status_code == 200:
                        tree_items = tree_resp.json().get("tree", [])
                        ascii_tree = _build_tree_from_git_tree(tree_items)
                        if ascii_tree:
                            data["directory_tree"] = ascii_tree
                except Exception:
                    pass

    except Exception:
        pass

    return data


def build_readme_from_inputs(
    repo_url: str = None,
    description: str = None,
    tech_stack_items: list = None,
    theme: str = "default",
    section_order: list = None,
) -> dict:
    """Build a complete README from user inputs and live GitHub metadata."""
    repo_metadata = {}
    if repo_url:
        repo_metadata = fetch_github_repo_metadata(repo_url)

    project_name = repo_metadata.get("name") or "My Awesome Project"
    project_name_slug = repo_metadata.get("slug") or "my-awesome-project"
    clone_url = repo_metadata.get("clone_url") or "https://github.com/username/repo.git"
    short_description = repo_metadata.get("description") or "A modern, production-ready project built with high performance and clean architecture."

    # Fallback to URL path parsing if GitHub API did not return name
    if not repo_metadata and repo_url:
        parts = repo_url.rstrip("/").split("/")
        if len(parts) >= 2:
            project_name = parts[-1].replace("-", " ").replace("_", " ").title()
            project_name_slug = parts[-1]
            clone_url = repo_url.rstrip("/") + ".git"
            short_description = f"A modern solution built for {parts[-1]}."

    # Use provided description if explicitly supplied
    if description and description.strip():
        short_description = description.strip()

    # Combine user-selected tech stack with auto-detected tech
    combined_tech = list(tech_stack_items or [])
    for dt in repo_metadata.get("detected_tech", []):
        if dt not in combined_tech:
            combined_tech.append(dt)

    # Infer content blocks
    features_text = _infer_features(repo_url, short_description, combined_tech, repo_metadata)
    tech_stack_text = _infer_tech_stack(combined_tech)
    installation_steps_text = _infer_installation(combined_tech, repo_metadata)
    usage_instructions_text = _infer_usage(combined_tech, repo_metadata)
    detailed_usage_text = _infer_detailed_usage(combined_tech)
    config_text = _infer_configuration(combined_tech)
    structure_text = _infer_project_structure(combined_tech, repo_metadata)
    architecture_text = _infer_architecture(combined_tech)
    testing_text = _infer_testing(combined_tech, repo_metadata)
    troubleshooting_text = _infer_troubleshooting(combined_tech)
    deployment_guide_text = _infer_deployment(combined_tech)
    badges_text = _build_badges(project_name_slug, repo_metadata)
    prerequisites_text = _infer_prerequisites(combined_tech)

    response_data = {
        "project_name": project_name,
        "project_name_slug": project_name_slug,
        "description": short_description,
        "features": features_text,
        "tech_stack": tech_stack_text,
        "clone_url": clone_url,
        "installation_steps": installation_steps_text,
        "usage_instructions": usage_instructions_text,
        "detailed_usage": detailed_usage_text,
        "configuration": config_text,
        "project_structure": structure_text,
        "architecture": architecture_text,
        "testing": testing_text,
        "troubleshooting": troubleshooting_text,
        "deployment_guide": deployment_guide_text,
        "badges": badges_text,
        "prerequisites": prerequisites_text,
        "rate_limited": repo_metadata.get("rate_limited", False),
    }

    # Resolve active section order
    if not section_order:
        section_order = DEFAULT_SECTION_IDS

    dynamic_content = []

    # 1. Header & Title Block
    if theme == "hacker":
        dynamic_content.append(
            f"```\n"
            f"███╗   ███╗██╗███╗   ██╗██╗███╗   ███╗ █████╗ ██╗\n"
            f"████╗ ████║██║████╗  ██║██║████╗ ████║██╔══██╗██║\n"
            f"██╔████╔██║██║██╔██╗ ██║██║██╔████╔██║███████║██║\n"
            f"██║╚██╔╝██║██║██║╚██╗██║██║██║╚██╔╝██║██╔══██║██║\n"
            f"██║ ╚═╝ ██║██║██║ ╚████║██║██║ ╚═╝ ██║██║  ██║███████╗\n"
            f"╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝\n"
            f"```\n\n"
            f"> **Project:** {project_name}\n"
            f"> **Overview:** {short_description}\n\n"
            f"{badges_text}"
        )
    elif theme == "minimalist":
        dynamic_content.append(f"# {project_name}\n\n> {short_description}\n\n{badges_text}")
    else:
        dynamic_content.append(
            f"# {project_name}\n\n"
            f"{short_description}\n\n"
            f"<div align=\"center\">\n\n{badges_text}\n\n</div>"
        )

    # 2. Render each section in configured order
    for sec_id in section_order:
        if sec_id == "features":
            if theme == "hacker":
                dynamic_content.append(f"## [0x01] FEATURES\n\n{features_text}")
            elif theme == "minimalist":
                dynamic_content.append(f"## Features\n\n{features_text}")
            else:
                dynamic_content.append(f"## ✨ Features\n\n{features_text}")

        elif sec_id == "tech_stack":
            if theme == "hacker":
                dynamic_content.append(f"## [0x02] TECH STACK\n\n{tech_stack_text}")
            elif theme == "minimalist":
                dynamic_content.append(f"## Tech Stack\n\n{tech_stack_text}")
            else:
                dynamic_content.append(f"## 📚 Tech Stack\n\n{tech_stack_text}")

        elif sec_id == "project_structure":
            if theme == "hacker":
                dynamic_content.append(f"## [0x03] DIRECTORY TREE\n\n```\n{structure_text}\n```")
            elif theme == "minimalist":
                dynamic_content.append(f"## Project Structure\n\n```\n{structure_text}\n```")
            else:
                dynamic_content.append(f"## 🏗️ Project Structure\n\n```\n{structure_text}\n```")

        elif sec_id == "installation":
            if theme == "hacker":
                dynamic_content.append(f"## [0x04] INSTALLATION\n\n```bash\n# Clone & Setup\ngit clone {clone_url}\ncd {project_name_slug}\n{installation_steps_text}\n```")
            elif theme == "minimalist":
                dynamic_content.append(f"## Setup\n\n```bash\ngit clone {clone_url}\ncd {project_name_slug}\n{installation_steps_text}\n```")
            else:
                dynamic_content.append(
                    f"## 🚀 Getting Started\n\n"
                    f"### Prerequisites\n\n"
                    f"{prerequisites_text}\n\n"
                    f"### Installation\n\n"
                    f"```bash\n"
                    f"# Clone the repository\n"
                    f"git clone {clone_url}\n"
                    f"cd {project_name_slug}\n\n"
                    f"# Install dependencies\n"
                    f"{installation_steps_text}\n"
                    f"```"
                )

        elif sec_id == "usage":
            if theme == "hacker":
                dynamic_content.append(f"## [0x05] USAGE\n\n```bash\n{usage_instructions_text}\n```")
            elif theme == "minimalist":
                dynamic_content.append(f"## Usage\n\n```bash\n{usage_instructions_text}\n```")
            else:
                dynamic_content.append(
                    f"## 📖 Usage\n\n"
                    f"```bash\n{usage_instructions_text}\n```\n\n"
                    f"{detailed_usage_text}"
                )

        elif sec_id == "configuration":
            if theme == "hacker":
                dynamic_content.append(f"## [0x06] CONFIGURATION (.ENV)\n\n{config_text}")
            elif theme == "minimalist":
                dynamic_content.append(f"## Configuration\n\n{config_text}")
            else:
                dynamic_content.append(f"## 🔧 Configuration\n\n{config_text}")

        elif sec_id == "architecture":
            if theme == "hacker":
                dynamic_content.append(f"## [0x07] ARCHITECTURE\n\n{architecture_text}")
            elif theme == "minimalist":
                dynamic_content.append(f"## Architecture\n\n{architecture_text}")
            else:
                dynamic_content.append(f"## 📁 Project Architecture\n\n{architecture_text}")

        elif sec_id == "testing":
            if theme == "hacker":
                dynamic_content.append(f"## [0x08] TEST SUITE\n\n```bash\n{testing_text}\n```")
            elif theme == "minimalist":
                dynamic_content.append(f"## Testing\n\n```bash\n{testing_text}\n```")
            else:
                dynamic_content.append(f"## 🧪 Testing\n\nRun the automated test suite:\n\n```bash\n{testing_text}\n```")

        elif sec_id == "troubleshooting":
            if theme == "hacker":
                dynamic_content.append(f"## [0x09] DEBUG & TROUBLESHOOTING\n\n{troubleshooting_text}")
            elif theme == "minimalist":
                dynamic_content.append(f"## Troubleshooting\n\n{troubleshooting_text}")
            else:
                dynamic_content.append(f"## 🐛 Troubleshooting\n\n{troubleshooting_text}")

        elif sec_id == "deployment":
            if theme == "hacker":
                dynamic_content.append(f"## [0x0A] DEPLOYMENT\n\n{deployment_guide_text}")
            elif theme == "minimalist":
                dynamic_content.append(f"## Deployment\n\n{deployment_guide_text}")
            else:
                dynamic_content.append(f"## 🌐 Deployment\n\n{deployment_guide_text}")

        elif sec_id == "contributing":
            if theme == "hacker":
                dynamic_content.append(
                    "## [0x00] CONTRIBUTING & LICENSE\n\n"
                    "Pull requests are welcome. For major changes, please open an issue first.\n\n"
                    "This project is licensed under the MIT License."
                )
            elif theme == "minimalist":
                dynamic_content.append(
                    "## Contributing & License\n\n"
                    "1. Fork this repository\n"
                    "2. Create your branch (`git checkout -b feature/cool-feature`)\n"
                    "3. Open a Pull Request\n\n"
                    "Licensed under the MIT License."
                )
            else:
                dynamic_content.append(
                    "## 📝 Contributing\n\n"
                    "Contributions are what make the open-source community such an amazing place to learn, inspire, and create!\n\n"
                    "1. Fork the Project\n"
                    "2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)\n"
                    "3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)\n"
                    "4. Push to the Branch (`git push origin feature/AmazingFeature`)\n"
                    "5. Open a Pull Request\n\n"
                    "## 📄 License\n\n"
                    "Distributed under the MIT License. See `LICENSE` for more information.\n\n"
                    "---\n\n"
                    "<div align=\"center\">\n\n"
                    "Made with ❤️ and dedication\n\n"
                    "</div>"
                )

    response_data["dynamic_markdown"] = "\n\n".join(dynamic_content)
    return response_data


def _infer_features(repo_url: str, description: str, tech_stack_items: list, repo_metadata: dict = None) -> str:
    """Infer features from inputs and GitHub metadata."""
    features = [
        "⚡ **High Performance** - Fast, lightweight, and optimized for speed",
        "🎨 **Clean UI / UX** - Modern design with responsive layouts",
        "🛡️ **Production-Ready** - Structured architecture following best practices",
    ]

    if repo_metadata and repo_metadata.get("topics"):
        topics_str = ", ".join(f"`{t}`" for t in repo_metadata["topics"][:5])
        features.insert(0, f"🏷️ **Ecosystem Topics**: {topics_str}")

    if description:
        desc_lower = description.lower()
        if "api" in desc_lower or "rest" in desc_lower:
            features.append("🔌 **RESTful API** - Modular endpoints with comprehensive documentation")
        if "auth" in desc_lower or "security" in desc_lower:
            features.append("🔐 **Secure Authentication** - Token validation and role-based protection")
        if "real-time" in desc_lower or "realtime" in desc_lower or "socket" in desc_lower:
            features.append("🔄 **Real-Time Updates** - Live synchronization and reactive data streams")
        if "ai" in desc_lower or "ml" in desc_lower or "gpt" in desc_lower or "llm" in desc_lower:
            features.append("🤖 **AI-Powered** - Intelligent automation and natural language capabilities")
        if "mobile" in desc_lower:
            features.append("📱 **Mobile Responsive** - Pixel-perfect layout across desktop, tablet, and mobile")

    if tech_stack_items:
        if any(t in tech_stack_items for t in ["React", "Next.js", "Vue", "Svelte"]):
            features.insert(0, "⚛️ **Component-Driven UI** - Declarative and reactive frontend architecture")
        if any(t in tech_stack_items for t in ["FastAPI", "Go", "Rust"]):
            features.insert(1, "🚀 **High-Throughput Backend** - Low-latency async execution")
        if any(t in tech_stack_items for t in ["Docker"]):
            features.append("🐳 **Docker Containerization** - One-command reproducible local and cloud environment")
        if any(t in tech_stack_items for t in ["GitHub Actions", "Jenkins"]):
            features.append("🔄 **Automated CI/CD** - Automated test, lint, and build verification")

    return "\n".join([f"- {f}" for f in features])


def _infer_tech_stack(tech_stack_items: list) -> str:
    """Infer organized tech stack from selected items."""
    if not tech_stack_items:
        return (
            "**Frontend:** React • Vite • Tailwind CSS\n\n"
            "**Backend:** FastAPI • Python\n\n"
            "**Deployment:** Vercel"
        )

    frontend_techs = [t for t in tech_stack_items if t in
        ["React", "Next.js", "Vue", "Angular", "Svelte", "Remix", "TypeScript", "Tailwind CSS", "Vite", "Webpack", "JavaScript"]]
    backend_techs = [t for t in tech_stack_items if t in
        ["Node.js", "FastAPI", "Flask", "Django", "Go", "Rust", "Java/Spring", ".NET/C#", "Python", "PHP/Laravel", "Ruby", "C++"]]
    database_techs = [t for t in tech_stack_items if t in
        ["MongoDB", "MySQL", "PostgreSQL", "SQLite", "Redis", "DynamoDB", "Firestore", "Elasticsearch"]]
    devops_techs = [t for t in tech_stack_items if t in
        ["Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "Vercel", "Netlify", "Heroku", "GitHub Actions", "Jenkins"]]
    testing_techs = [t for t in tech_stack_items if t in
        ["Jest", "Pytest", "Cypress", "Postman", "Vitest", "Playwright"]]

    other_techs = [t for t in tech_stack_items if t not in frontend_techs + backend_techs + database_techs + devops_techs + testing_techs]

    blocks = []
    if frontend_techs:
        blocks.append(f"**Frontend:**\n{' • '.join(frontend_techs)}")
    if backend_techs:
        blocks.append(f"**Backend:**\n{' • '.join(backend_techs)}")
    if database_techs:
        blocks.append(f"**Database:**\n{' • '.join(database_techs)}")
    if devops_techs:
        blocks.append(f"**DevOps & Cloud:**\n{' • '.join(devops_techs)}")
    if testing_techs:
        blocks.append(f"**Testing & Quality:**\n{' • '.join(testing_techs)}")
    if other_techs:
        blocks.append(f"**Tools & Libraries:**\n{' • '.join(other_techs)}")

    return "\n\n".join(blocks)


def _infer_project_structure(tech_stack_items: list, repo_metadata: dict = None) -> str:
    """Infer directory structure or use real ASCII tree from GitHub."""
    if repo_metadata and repo_metadata.get("directory_tree"):
        return repo_metadata["directory_tree"]

    has_frontend = any(t in (tech_stack_items or []) for t in ["React", "Next.js", "Vue", "Vite", "Frontend", "TypeScript"])
    has_backend = any(t in (tech_stack_items or []) for t in ["FastAPI", "Flask", "Django", "Node.js", "Go", "Rust", "Python", "Backend"])

    if has_frontend and has_backend:
        return (
            ".\n"
            "├── frontend/             # Client application\n"
            "│   ├── src/              # React components & views\n"
            "│   ├── public/           # Static assets\n"
            "│   └── package.json      # Frontend dependencies\n"
            "├── backend/              # Server / API service\n"
            "│   ├── app.py            # API routes and controllers\n"
            "│   └── requirements.txt  # Backend dependencies\n"
            "├── tests/                # Automated test suite\n"
            "└── README.md             # Project documentation"
        )
    elif has_frontend:
        return (
            ".\n"
            "├── src/                  # Application source code\n"
            "│   ├── components/       # Reusable UI components\n"
            "│   ├── hooks/            # Custom React hooks\n"
            "│   └── App.jsx           # Main entry view\n"
            "├── public/               # Static assets & icons\n"
            "├── index.html            # HTML template\n"
            "├── package.json          # Dependencies & build scripts\n"
            "└── README.md             # Documentation"
        )
    else:
        return (
            ".\n"
            "├── src/                  # Core source files\n"
            "│   └── main.py           # Application entry point\n"
            "├── tests/                # Unit & integration tests\n"
            "├── requirements.txt      # Project dependencies\n"
            "└── README.md             # Documentation"
        )


def _infer_installation(tech_stack_items: list, repo_metadata: dict = None) -> str:
    """Infer installation steps from tech stack and repo metadata."""
    if repo_metadata and repo_metadata.get("custom_install"):
        return repo_metadata["custom_install"]

    techs = tech_stack_items or []
    has_node = any(t in techs for t in ["React", "Next.js", "Vue", "Node.js", "TypeScript", "Vite"])
    has_py = any(t in techs for t in ["FastAPI", "Flask", "Django", "Python"])
    has_rust = any(t in techs for t in ["Rust"])
    has_go = any(t in techs for t in ["Go"])

    steps = []
    if has_node and has_py:
        steps.append("# Install backend dependencies\ncd backend && pip install -r requirements.txt\n\n# Install frontend dependencies\ncd ../frontend && npm install")
    elif has_node:
        steps.append("npm install")
    elif has_py:
        steps.append("python -m venv venv\nsource venv/bin/activate  # Or venv\\Scripts\\activate on Windows\npip install -r requirements.txt")
    elif has_rust:
        steps.append("cargo build")
    elif has_go:
        steps.append("go mod download")
    else:
        steps.append("npm install")

    return "\n".join(steps)


def _infer_usage(tech_stack_items: list, repo_metadata: dict = None) -> str:
    """Infer primary start/run instructions."""
    if repo_metadata and repo_metadata.get("custom_usage"):
        return repo_metadata["custom_usage"]

    techs = tech_stack_items or []
    has_node = any(t in techs for t in ["React", "Next.js", "Vue", "Node.js", "Vite"])
    has_py = any(t in techs for t in ["FastAPI", "Flask", "Django", "Python"])

    if has_node and has_py:
        return (
            "# Terminal 1: Start backend server\n"
            "cd backend && uvicorn app:app --reload --port 8000\n\n"
            "# Terminal 2: Start frontend dev server\n"
            "cd frontend && npm run dev"
        )
    elif has_py:
        return "uvicorn app:app --reload --port 8000"
    elif any(t in techs for t in ["Rust"]):
        return "cargo run"
    elif any(t in techs for t in ["Go"]):
        return "go run main.go"
    else:
        return "npm run dev"


def _infer_detailed_usage(tech_stack_items: list) -> str:
    """Infer workflow guide."""
    techs = tech_stack_items or []
    has_api = any(t in techs for t in ["FastAPI", "Flask", "Django", "Node.js", "Go", "REST API"])

    guide = (
        "### Quick Start Workflow\n\n"
        "1. **Start the local server** using the instructions above.\n"
        "2. **Access the application** at `http://localhost:3000` (or `http://localhost:8000`).\n"
        "3. **Inspect changes** in real time via hot module reloading."
    )
    if has_api:
        guide += (
            "\n\n### Interactive API Documentation\n\n"
            "- **Swagger UI:** Visit `http://localhost:8000/docs` to test endpoints interactively.\n"
            "- **ReDoc:** Visit `http://localhost:8000/redoc` for detailed OpenAPI specifications."
        )
    return guide


def _infer_configuration(tech_stack_items: list) -> str:
    """Generate configuration and .env sample documentation."""
    techs = tech_stack_items or []
    env_vars = ["PORT=8000", "NODE_ENV=development"]
    if any(t in techs for t in ["PostgreSQL", "MySQL", "MongoDB"]):
        env_vars.append("DATABASE_URL=postgresql://user:password@localhost:5432/app_db")
    if any(t in techs for t in ["Redis"]):
        env_vars.append("REDIS_URL=redis://localhost:6379")
    env_vars.append("SECRET_KEY=your_super_secret_key_here")

    env_block = "\n".join(env_vars)
    return (
        "Create a `.env` file in the root directory:\n\n"
        "```env\n"
        f"{env_block}\n"
        "```\n\n"
        "| Variable | Description | Default |\n"
        "| :--- | :--- | :--- |\n"
        "| `PORT` | Application server port | `8000` |\n"
        "| `NODE_ENV` | Environment mode | `development` |\n"
        "| `SECRET_KEY` | Encryption and session secret | *(Required)* |"
    )


def _infer_architecture(tech_stack_items: list) -> str:
    """Infer architectural pattern."""
    techs = tech_stack_items or []
    return (
        "```\n"
        "┌──────────────────────┐         ┌──────────────────────┐\n"
        "│    Frontend Layer    │ ──────> │    API / Backend     │\n"
        "│ (React / Client App) │  HTTP   │ (FastAPI / Server)   │\n"
        "└──────────────────────┘         └──────────┬───────────┘\n"
        "                                            │ Query\n"
        "                                            ▼\n"
        "                                 ┌──────────────────────┐\n"
        "                                 │  Database & Cache    │\n"
        "                                 └──────────────────────┘\n"
        "```\n\n"
        "- **Presentation Layer:** Component-based UI with responsive layouts and client-side routing.\n"
        "- **API Layer:** Validated REST endpoints with serialization and error handling.\n"
        "- **Service Layer:** Decoupled business logic designed for testability and maintainability."
    )


def _infer_testing(tech_stack_items: list, repo_metadata: dict = None) -> str:
    """Infer test execution commands."""
    if repo_metadata and repo_metadata.get("custom_test"):
        return repo_metadata["custom_test"]

    techs = tech_stack_items or []
    commands = []
    if any(t in techs for t in ["Python", "FastAPI", "Flask", "Django"]):
        commands.append("# Run backend tests\npytest -v --cov=.")
    if any(t in techs for t in ["React", "Next.js", "Node.js", "Vite", "TypeScript"]):
        commands.append("# Run frontend tests\nnpm test")
    if any(t in techs for t in ["Rust"]):
        commands.append("cargo test")
    if any(t in techs for t in ["Go"]):
        commands.append("go test -v ./...")

    return "\n\n".join(commands) if commands else "npm test"


def _infer_troubleshooting(tech_stack_items: list) -> str:
    """Generate common troubleshooting solutions."""
    return (
        "**Issue: Port already in use**\n"
        "```bash\n"
        "# Find and terminate the blocking process (Unix/macOS)\n"
        "lsof -ti:8000 | xargs kill -9\n\n"
        "# Windows PowerShell\n"
        "Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process\n"
        "```\n\n"
        "**Issue: Dependencies out of date or broken**\n"
        "```bash\n"
        "# Clean and reinstall dependencies\n"
        "rm -rf node_modules package-lock.json\n"
        "npm install\n"
        "```"
    )


def _infer_deployment(tech_stack_items: list) -> str:
    """Infer deployment instructions, prioritizing Vercel."""
    return (
        "### Deploy to Vercel (Recommended)\n\n"
        "The fastest way to deploy your full-stack application:\n\n"
        "[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)\n\n"
        "```bash\n"
        "# Deploy using Vercel CLI\n"
        "npm i -g vercel\n"
        "vercel\n"
        "```\n\n"
        "### Docker Deployment\n\n"
        "```bash\n"
        "# Build and run via Docker Compose\n"
        "docker compose up --build -d\n"
        "```"
    )


def _build_badges(project_slug: str, repo_metadata: dict = None) -> str:
    """Build dynamic markdown badges."""
    if repo_metadata and repo_metadata.get("full_name"):
        full_name = repo_metadata["full_name"]
        lic = repo_metadata.get("license") or "MIT"
        return (
            f"[![GitHub Stars](https://img.shields.io/github/stars/{full_name}?style=for-the-badge&logo=github&color=blue)](https://github.com/{full_name}/stargazers) "
            f"[![GitHub Forks](https://img.shields.io/github/forks/{full_name}?style=for-the-badge&logo=github&color=blue)](https://github.com/{full_name}/network/members) "
            f"[![License](https://img.shields.io/badge/License-{lic}-green.svg?style=for-the-badge)](LICENSE) "
            f"[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com)"
        )

    return (
        "![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge) "
        "![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge) "
        "![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=for-the-badge) "
        "![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)"
    )


def _infer_prerequisites(tech_stack_items: list) -> str:
    """Infer prerequisites from tech stack."""
    techs = tech_stack_items or []
    prereqs = []

    if any(t in techs for t in ["React", "Next.js", "Vue", "Node.js", "Vite", "TypeScript"]):
        prereqs.append("- **Node.js**: `v18.0.0+` and **npm** `v9.0.0+`")
    if any(t in techs for t in ["FastAPI", "Flask", "Django", "Python"]):
        prereqs.append("- **Python**: `3.9+` and **pip**")
    if any(t in techs for t in ["Docker"]):
        prereqs.append("- **Docker**: `v24.0+` and **Docker Compose**")
    if any(t in techs for t in ["Rust"]):
        prereqs.append("- **Rust & Cargo**: `latest stable`")
    if any(t in techs for t in ["Go"]):
        prereqs.append("- **Go**: `1.21+`")

    if not prereqs:
        prereqs = ["- **Git**: `2.30+`", "- **Node.js**: `18.0+`", "- **Python**: `3.9+`"]

    return "\n".join(prereqs)


def generate_contributing(project_name: str) -> str:
    """Generate a comprehensive CONTRIBUTING.md file."""
    return f"""# Contributing to {project_name}

First off, thank you for considering contributing to {project_name}! 🎉

Every contribution, whether it's bug reports, feature suggestions, or pull requests, helps make this project better for everyone.

## 📜 Code of Conduct

By participating in this project, you agree to uphold a welcoming, respectful, and harassment-free environment for all participants.

## 🐛 How to Report a Bug

1. **Search existing issues** to see if the bug has already been reported.
2. If not, open a new **Bug Report** issue.
3. Include:
   - Clear steps to reproduce the issue.
   - Expected vs. actual behavior.
   - Operating system, browser, and runtime version details.
   - Screenshots or console logs if applicable.

## 💡 How to Propose a Feature

1. Open an **Enhancement** issue to discuss your proposal with the maintainers.
2. Explain the use case and why this feature would benefit other users.

## 🚀 Submitting a Pull Request

1. **Fork** the repository and create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. **Make your changes** cleanly and test thoroughly.
3. **Commit** with descriptive commit messages following Conventional Commits format (`feat:`, `fix:`, `docs:`, `refactor:`).
4. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request** to the `main` branch with a clear summary of your changes.

Thank you for contributing! ❤️
"""


def generate_license() -> str:
    """Generate a standard MIT LICENSE file with dynamic year."""
    year = datetime.datetime.now().year
    return f"""MIT License

Copyright (c) {year} README Studio Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""
