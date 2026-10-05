"""
README Studio Backend API
FastAPI service compatible with local development, Docker, and Vercel Serverless Functions.
"""

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import re

from prompts import build_readme_from_inputs, generate_contributing, generate_license, fetch_github_repo_metadata

# Initialize FastAPI app
app = FastAPI(
    title="README Studio API",
    version="1.0.0",
    description="Generate professional README.md files and documentation suites automatically"
)

# Enable CORS (standard compliant: wildcard origin without credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request schema
class ReadmeRequest(BaseModel):
    repo_url: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    generate_suite: Optional[bool] = False
    theme: Optional[str] = "default"
    section_order: Optional[List[str]] = None


class ScanRepoRequest(BaseModel):
    repo_url: str


# Response schema
class ReadmeResponse(BaseModel):
    markdown: str
    metadata: dict
    additional_files: Optional[dict] = None
    rate_limited: Optional[bool] = False


def validate_inputs(req: ReadmeRequest) -> bool:
    """Validate that at least one meaningful input is provided."""
    if not (req.repo_url and req.repo_url.strip()) and not (req.description and req.description.strip()):
        return False
    return True


def clean_url(url: str) -> str:
    """Clean and normalize GitHub URL."""
    if not url:
        return ""
    url = url.strip().rstrip("/")
    if url.endswith(".git"):
        url = url[:-4]
    return url.rstrip("/")


# Create router to mount on both "/" and "/api"
api_router = APIRouter()


@api_router.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "README Studio API", "version": "1.0.0"}


@api_router.post("/scan-repo")
def scan_repository(req: ScanRepoRequest):
    """
    Deep scan a GitHub repository to extract tech stack, topics,
    scripts, dependencies, stars, license, and directory tree.
    """
    clean_repo = clean_url(req.repo_url)
    if not clean_repo:
        raise HTTPException(status_code=400, detail="Invalid GitHub repository URL")

    meta = fetch_github_repo_metadata(clean_repo)
    if not meta or not meta.get("slug"):
        raise HTTPException(
            status_code=404,
            detail="Repository not found, is private, or GitHub API rate limit reached."
        )

    return {
        "success": True,
        "repo_name": meta.get("slug", ""),
        "full_name": meta.get("full_name", ""),
        "description": meta.get("description", ""),
        "detected_tech": meta.get("detected_tech", []),
        "primary_language": meta.get("language", ""),
        "stars": meta.get("stars", 0),
        "forks": meta.get("forks", 0),
        "license": meta.get("license", "MIT"),
        "topics": meta.get("topics", []),
        "directory_tree": meta.get("directory_tree", ""),
        "custom_install": meta.get("custom_install"),
        "custom_usage": meta.get("custom_usage"),
        "custom_test": meta.get("custom_test"),
        "rate_limited": meta.get("rate_limited", False)
    }


@api_router.post("/generate-readme", response_model=ReadmeResponse)
def generate_readme(req: ReadmeRequest):
    """
    Generate a README.md file and optional documentation suite
    from a repository URL or project description.
    """
    if not validate_inputs(req):
        raise HTTPException(
            status_code=400,
            detail="Please provide either a GitHub repository URL or a project description."
        )

    clean_repo_url = clean_url(req.repo_url) if req.repo_url else None
    clean_desc = req.description.strip()[:10000] if req.description else None

    try:
        readme_data = build_readme_from_inputs(
            repo_url=clean_repo_url,
            description=clean_desc,
            tech_stack_items=req.tech_stack or [],
            theme=req.theme or "default",
            section_order=req.section_order or None
        )

        markdown = readme_data.get("dynamic_markdown", "")

        additional_files = {}
        if req.generate_suite:
            additional_files["CONTRIBUTING.md"] = generate_contributing(readme_data["project_name"])
            additional_files["LICENSE"] = generate_license()

        return ReadmeResponse(
            markdown=markdown,
            metadata={
                "project_name": readme_data["project_name"],
                "tech_stack": readme_data["tech_stack"],
                "generated": True,
            },
            additional_files=additional_files,
            rate_limited=readme_data.get("rate_limited", False)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating README: {str(e)}"
        )


@api_router.get("/")
def root():
    """Root metadata endpoint."""
    return {
        "message": "README Studio API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health or /api/health",
            "generate": "/generate-readme or /api/generate-readme (POST)",
            "docs": "/docs"
        }
    }


# Mount the router both with and without /api prefix for maximum deployment flexibility
app.include_router(api_router)
app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
