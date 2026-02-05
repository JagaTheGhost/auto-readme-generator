"""
Auto README Generator Backend API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import re

from prompts import README_TEMPLATE, build_readme_from_inputs

# Initialize FastAPI app
app = FastAPI(
    title="Auto README Generator API",
    version="1.0.0",
    description="Generate professional README.md files automatically"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request schema
class ReadmeRequest(BaseModel):
    repo_url: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None


# Response schema
class ReadmeResponse(BaseModel):
    markdown: str
    metadata: dict


def validate_inputs(req: ReadmeRequest) -> bool:
    """Validate that at least one input is provided."""
    if not req.repo_url and not req.description:
        return False
    return True


def is_valid_github_url(url: str) -> bool:
    """Validate GitHub URL format."""
    github_pattern = r"https?://(?:www\.)?github\.com/[\w-]+/[\w.-]+(?:/)?$"
    return re.match(github_pattern, url) is not None


def clean_url(url: str) -> str:
    """Clean and normalize GitHub URL."""
    if not url:
        return ""
    url = url.strip()
    if url.endswith(".git"):
        url = url[:-4]
    if url.endswith("/"):
        url = url[:-1]
    return url


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "Auto README Generator API"}


@app.post("/generate-readme", response_model=ReadmeResponse)
def generate_readme(req: ReadmeRequest):
    """
    Generate a README.md file from repository URL or project description.
    
    Args:
        req: ReadmeRequest containing repo_url, description, and/or tech_stack
    
    Returns:
        ReadmeResponse with generated markdown and metadata
    
    Raises:
        HTTPException: If validation fails
    """
    
    # Validate inputs
    if not validate_inputs(req):
        raise HTTPException(
            status_code=400,
            detail="Please provide either a GitHub repository URL or a project description."
        )
    
    # Validate GitHub URL if provided
    if req.repo_url:
        req.repo_url = clean_url(req.repo_url)
        # Note: We skip strict validation for now to allow flexibility
        # In production, you might want stricter validation
    
    # Limit description length
    if req.description and len(req.description) > 1000:
        raise HTTPException(
            status_code=400,
            detail="Description must be 1000 characters or less."
        )
    
    try:
        # Build README from inputs
        readme_data = build_readme_from_inputs(
            repo_url=req.repo_url,
            description=req.description,
            tech_stack_items=req.tech_stack or []
        )
        
        # Format the README using template
        markdown = README_TEMPLATE.format(
            project_name=readme_data["project_name"],
            description=readme_data["description"],
            features=readme_data["features"],
            tech_stack=readme_data["tech_stack"],
            clone_url=readme_data["clone_url"],
            project_name_slug=readme_data["project_name_slug"],
            installation_steps=readme_data["installation_steps"],
            usage_instructions=readme_data["usage_instructions"],
            detailed_usage=readme_data["detailed_usage"],
            architecture=readme_data["architecture"],
            deployment_guide=readme_data["deployment_guide"],
            badges=readme_data["badges"],
            prerequisites=readme_data["prerequisites"],
        )
        
        return ReadmeResponse(
            markdown=markdown,
            metadata={
                "project_name": readme_data["project_name"],
                "tech_stack": readme_data["tech_stack"],
                "generated": True,
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating README: {str(e)}"
        )


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Auto README Generator API",
        "endpoints": {
            "health": "/health",
            "generate": "/generate-readme (POST)",
            "docs": "/docs"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
