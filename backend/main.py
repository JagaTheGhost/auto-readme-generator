"""
Auto README Generator Backend API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import re

from prompts import build_readme_from_inputs

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
    generate_suite: Optional[bool] = False
    theme: Optional[str] = "default"
    section_order: Optional[List[str]] = None


# Response schema
class ReadmeResponse(BaseModel):
    markdown: str
    metadata: dict
    additional_files: Optional[dict] = None


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
            tech_stack_items=req.tech_stack or [],
            theme=req.theme or "default",
            section_order=req.section_order or None
        )
        
        # With dynamic section ordering, the formatting is pre-done in prompts.py
        markdown = readme_data.get("dynamic_markdown", "Error generating dynamic markdown")
        
        additional_files = {}
        if req.generate_suite:
            from prompts import generate_contributing, generate_license
            additional_files["CONTRIBUTING.md"] = generate_contributing(readme_data["project_name"])
            additional_files["LICENSE"] = generate_license()
        
        return ReadmeResponse(
            markdown=markdown,
            metadata={
                "project_name": readme_data["project_name"],
                "tech_stack": readme_data["tech_stack"],
                "generated": True,
            },
            additional_files=additional_files
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
