from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import json
import os
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/ieee",
    tags=["ieee"],
    dependencies=[Depends(get_current_user)],
)

# Pydantic models for request/response
class IEEESearchResult(BaseModel):
    article_number: str
    title: str
    authors: Optional[List[str]]
    publication_title: Optional[str]
    publication_year: Optional[int]
    abstract: Optional[str]
    doi: Optional[str]
    url: Optional[str]
    pdf_url: Optional[str]
    start_page: Optional[str]
    end_page: Optional[str]

class IEEESearchResponse(BaseModel):
    results: List[IEEESearchResult]
    total_results: int
    search_time: float

@router.get("/search", response_model=IEEESearchResponse)
async def search_ieee(
    query: str = Query(..., min_length=1, description="Search query for IEEE Xplore"),
    max_records: int = Query(10, ge=1, le=200, description="Number of results to return per page (1-200)"),
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    year_start: Optional[int] = Query(None, description="Start year for publication date filter"),
    year_end: Optional[int] = Query(None, description="End year for publication date filter"),
    author: Optional[str] = Query(None, description="Author name filter"),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Search IEEE Xplore using IEEE Xplore API
    
    Args:
        query: Search query string (querytext parameter)
        max_records: Number of results to return per page (1-200)
        page: Page number (starts from 1)
        year_start: Start year for publication date filter
        year_end: End year for publication date filter
        author: Author name filter
        current_user: Authenticated user (automatically injected)
        
    Returns:
        IEEESearchResponse: Search results from IEEE Xplore
        
    Example:
        - Page 1: start_record=1
        - Page 2: start_record=(page-1) * max_records + 1
        - Page 2 with max_records=20: start_record=21
    """
    
    try:
        import time
        start_time = time.time()
        
        # Calculate start_record based on page number
        # Page 1 → start_record=1
        # Page 2 → start_record=(page-1) * max_records + 1
        start_record = (page - 1) * max_records + 1
        
        # IEEE Xplore API URL
        # URL format: https://ieeexploreapi.ieee.org/api/v1/search/articles?parameter&apikey=YOUR_API_KEY
        ieee_url = "https://ieeexploreapi.ieee.org/api/v1/search/articles"
        
        # Build search parameters
        params = {
            "querytext": query,
            "max_records": max_records,
            "start_record": start_record,  # IEEE API uses 1-based indexing
            "format": "json"
        }
        
        # Add year filter if provided
        if year_start or year_end:
            if year_start and year_end:
                params["publication_year"] = f"{year_start}:{year_end}"
            elif year_start:
                params["publication_year"] = f"{year_start}:2024"  # Default end year
            elif year_end:
                params["publication_year"] = f"1900:{year_end}"  # Default start year
        
        # Add author filter if provided
        if author:
            params["author"] = author
        
        # Add API key
        ieee_api_key = os.getenv("IEEE_API_KEY")
        if not ieee_api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="IEEE API key not configured. Please set IEEE_API_KEY environment variable."
            )
        
        # Development mode: if API key is test key, return mock data
        if ieee_api_key == "test_key_for_development":
            # Return mock data for testing
            mock_results = [
                IEEESearchResult(
                    article_number="9999999",
                    title=f"Mock IEEE Article {i+1}: {query}",
                    authors=["Test Author", "Another Author"],
                    publication_title="IEEE Test Journal",
                    publication_year=2023,
                    abstract=f"This is a mock abstract for testing IEEE API integration with query: {query}",
                    doi=f"10.1109/TEST.2023.{i+1}",
                    url=f"https://ieeexplore.ieee.org/document/9999999{i+1}",
                    pdf_url=f"https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=9999999{i+1}",
                    start_page=str(i*10 + 1),
                    end_page=str(i*10 + 10)
                ) for i in range(min(max_records, 5))  # Limit mock results to 5
            ]
            
            return IEEESearchResponse(
                results=mock_results,
                total_results=100,  # Mock total
                search_time=time.time() - start_time
            )
        
        params["apikey"] = ieee_api_key
        
        # Make API request
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(ieee_url, params=params)
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"IEEE Xplore API request failed with status {response.status_code}: {response.text}"
            )
        
        # Parse JSON response
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to parse IEEE API response as JSON: {str(e)}"
            )
        
        # Extract results
        articles = data.get("articles", [])
        total_results = data.get("total_records", 0)
        
        search_results = []
        
        for article in articles:
            try:
                # Extract article information
                article_number = str(article.get("article_number", ""))
                title = article.get("title", "")
                
                # Extract authors
                authors = []
                authors_data = article.get("authors", {})
                if isinstance(authors_data, dict) and "authors" in authors_data:
                    for author_info in authors_data["authors"]:
                        if isinstance(author_info, dict):
                            full_name = author_info.get("full_name", "")
                            if full_name:
                                authors.append(full_name)
                
                # Extract other fields
                publication_title = article.get("publication_title", None)
                publication_year = article.get("publication_year", None)
                if publication_year:
                    try:
                        publication_year = int(publication_year)
                    except (ValueError, TypeError):
                        publication_year = None
                
                abstract = article.get("abstract", None)
                doi = article.get("doi", None)
                
                # Create URLs
                url = None
                pdf_url = None
                if article_number:
                    url = f"https://ieeexplore.ieee.org/document/{article_number}"
                    pdf_url = f"https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber={article_number}"
                
                start_page = article.get("start_page", None)
                end_page = article.get("end_page", None)
                
                search_results.append(IEEESearchResult(
                    article_number=article_number,
                    title=title,
                    authors=authors if authors else None,
                    publication_title=publication_title,
                    publication_year=publication_year,
                    abstract=abstract,
                    doi=doi,
                    url=url,
                    pdf_url=pdf_url,
                    start_page=start_page,
                    end_page=end_page
                ))
                
            except Exception as e:
                # Skip this article if parsing fails
                continue
        
        return IEEESearchResponse(
            results=search_results,
            total_results=total_results,
            search_time=time.time() - start_time
        )
        
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Network error while connecting to IEEE Xplore API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while searching IEEE Xplore: {str(e)}"
        )