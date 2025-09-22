from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import os
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/google-scholar",
    tags=["google-scholar"],
    dependencies=[Depends(get_current_user)],
)

# Pydantic models for request/response
class ScholarSearchResult(BaseModel):
    title: str
    link: Optional[str]
    snippet: Optional[str]
    authors: Optional[List[str]]
    publication_info: Optional[str]
    cited_by: Optional[int]
    year: Optional[int]

class ScholarSearchResponse(BaseModel):
    results: List[ScholarSearchResult]
    total_results: int
    search_time: float

# New model for citation search
class ScholarCitationResult(BaseModel):
    title: str
    link: Optional[str]
    snippet: Optional[str]
    authors: Optional[List[str]]
    publication_info: Optional[str]
    cited_by: Optional[int]
    year: Optional[int]

class ScholarCitationResponse(BaseModel):
    results: List[ScholarCitationResult]
    total_results: int
    search_time: float

# Get Google Scholar API key from environment variables
GOOGLE_SCHOLAR_API_KEY = os.getenv("GOOGLE_SCHOLAR_KEY")

@router.get("/search", response_model=ScholarSearchResponse)
async def search_google_scholar(
    query: str = Query(..., min_length=1, description="Search query for Google Scholar"),
    limit: int = Query(10, ge=1, le=100, description="Number of results to return (1-100)"),
    offset: int = Query(0, ge=0, description="Number of results to skip for pagination"),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Search Google Scholar using SERP API
    
    Args:
        query: Search query string
        limit: Number of results to return (1-100)
        offset: Number of results to skip for pagination
        current_user: Authenticated user (automatically injected)
        
    Returns:
        ScholarSearchResponse: Search results from Google Scholar
    """
    if not GOOGLE_SCHOLAR_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Scholar API key not configured"
        )
    
    try:
        # Build the SERP API URL
        serp_api_url = "https://serpapi.com/search"
        params = {
            "engine": "google_scholar",
            "q": query,
            "api_key": GOOGLE_SCHOLAR_API_KEY,
            "num": limit,
            "start": offset  # SERP API uses 'start' parameter for offset
        }
        
        # Make request to SERP API
        async with httpx.AsyncClient() as client:
            response = await client.get(serp_api_url, params=params)
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google Scholar API request failed with status {response.status_code}"
            )
        
        data = response.json()
        
        # Parse the results
        search_results = []
        organic_results = data.get("organic_results", [])
        
        for result in organic_results:
            # Extract authors from publication info if available
            authors = []
            publication_info = result.get("publication_info", {})
            if "authors" in publication_info:
                authors = [author.get("name", "") for author in publication_info["authors"]]
            
            search_results.append(ScholarSearchResult(
                title=result.get("title", ""),
                link=result.get("link"),
                snippet=result.get("snippet"),
                authors=authors if authors else None,
                publication_info=publication_info.get("summary") if "summary" in publication_info else None,
                cited_by=result.get("inline_links", {}).get("cited_by", {}).get("total", 0),
                year=result.get("year")
            ))
        
        return ScholarSearchResponse(
            results=search_results,
            total_results=data.get("search_information", {}).get("total_results", 0),
            search_time=data.get("search_information", {}).get("search_time", 0.0)
        )
        
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Network error while connecting to Google Scholar API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while searching Google Scholar: {str(e)}"
        )

@router.get("/citation-search", response_model=ScholarCitationResponse)
async def search_google_scholar_citations(
    query: str = Query(..., min_length=1, description="Search query for Google Scholar Citations"),
    limit: int = Query(10, ge=1, le=100, description="Number of results to return (1-100)"),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Search Google Scholar Citations using SERP API
    
    Args:
        query: Search query string
        limit: Number of results to return (1-100)
        current_user: Authenticated user (automatically injected)
        
    Returns:
        ScholarCitationResponse: Citation search results from Google Scholar
    """
    if not GOOGLE_SCHOLAR_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Scholar API key not configured"
        )
    
    try:
        # Build the SERP API URL for citation search
        serp_api_url = "https://serpapi.com/search"
        params = {
            "engine": "google_scholar",
            "q": query,
            "api_key": GOOGLE_SCHOLAR_API_KEY,
            "num": limit
        }
        
        # Make request to SERP API
        async with httpx.AsyncClient() as client:
            response = await client.get(serp_api_url, params=params)
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google Scholar API request failed with status {response.status_code}"
            )
        
        data = response.json()
        
        # Parse the results
        search_results = []
        organic_results = data.get("organic_results", [])
        
        for result in organic_results:
            # Extract authors from publication info if available
            authors = []
            publication_info = result.get("publication_info", {})
            if "authors" in publication_info:
                authors = [author.get("name", "") for author in publication_info["authors"]]
            
            search_results.append(ScholarCitationResult(
                title=result.get("title", ""),
                link=result.get("link"),
                snippet=result.get("snippet"),
                authors=authors if authors else None,
                publication_info=publication_info.get("summary") if "summary" in publication_info else None,
                cited_by=result.get("inline_links", {}).get("cited_by", {}).get("total", 0),
                year=result.get("year")
            ))
        
        return ScholarCitationResponse(
            results=search_results,
            total_results=data.get("search_information", {}).get("total_results", 0),
            search_time=data.get("search_information", {}).get("time_taken_displayed", 0.0)
        )
        
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Network error while connecting to Google Scholar API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while searching Google Scholar: {str(e)}"
        )