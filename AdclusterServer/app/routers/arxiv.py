from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import xml.etree.ElementTree as ET
from datetime import datetime
import time
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel

router = APIRouter(
    prefix="/api/arxiv",
    tags=["arxiv"],
    dependencies=[Depends(get_current_user)],
)

# Pydantic models for request/response
class ArxivSearchResult(BaseModel):
    id: str
    title: str
    authors: List[str]
    abstract: Optional[str]
    published: str
    updated: Optional[str]
    doi: Optional[str]
    journal_ref: Optional[str]
    categories: List[str]
    pdf_url: str
    abs_url: str

class ArxivSearchResponse(BaseModel):
    results: List[ArxivSearchResult]
    total_results: int
    search_time: float

@router.get("/search", response_model=ArxivSearchResponse)
async def search_arxiv(
    search_query: str = Query(..., min_length=1, description="Search query for arXiv"),
    start: int = Query(0, ge=0, description="Starting index for results (0-based)"),
    max_results: int = Query(10, ge=1, le=100, description="Maximum number of results to return (1-100)"),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Search arXiv using arXiv API
    
    Args:
        search_query: Search query string
        start: Starting index for pagination (0-based)
        max_results: Maximum number of results to return (1-100)
        current_user: Authenticated user (automatically injected)
        
    Returns:
        ArxivSearchResponse: Search results from arXiv
    """
    
    try:
        start_time = time.time()
        
        # arXiv API URL
        # URL format: https://export.arxiv.org/api/query?search_query=<검색어>&start=<시작번호>&max_results=<표시개수>
        arxiv_url = "https://export.arxiv.org/api/query"
        
        # Build search parameters
        params = {
            "search_query": search_query,
            "start": start,
            "max_results": max_results
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(arxiv_url, params=params)
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"arXiv API request failed with status {response.status_code}"
            )
        
        # Parse XML response
        try:
            root = ET.fromstring(response.content)
        except ET.ParseError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error parsing arXiv XML response: {str(e)}"
            )
        
        # Define namespaces
        namespaces = {
            'atom': 'http://www.w3.org/2005/Atom',
            'arxiv': 'http://arxiv.org/schemas/atom'
        }
        
        # Extract total results from opensearch:totalResults
        total_results_elem = root.find('.//{http://a9.com/-/spec/opensearch/1.1/}totalResults')
        total_results = int(total_results_elem.text) if total_results_elem is not None else 0
        
        # Extract entries
        entries = root.findall('.//atom:entry', namespaces)
        search_results = []
        
        for entry in entries:
            try:
                # Extract basic information
                id_elem = entry.find('atom:id', namespaces)
                title_elem = entry.find('atom:title', namespaces)
                summary_elem = entry.find('atom:summary', namespaces)
                published_elem = entry.find('atom:published', namespaces)
                updated_elem = entry.find('atom:updated', namespaces)
                
                # Extract authors
                authors = []
                author_elems = entry.findall('atom:author', namespaces)
                for author_elem in author_elems:
                    name_elem = author_elem.find('atom:name', namespaces)
                    if name_elem is not None:
                        authors.append(name_elem.text.strip())
                
                # Extract categories
                categories = []
                category_elems = entry.findall('atom:category', namespaces)
                for category_elem in category_elems:
                    term = category_elem.get('term')
                    if term:
                        categories.append(term)
                
                # Extract DOI and journal reference
                doi = None
                journal_ref = None
                
                # Look for DOI in arxiv:doi
                doi_elem = entry.find('arxiv:doi', namespaces)
                if doi_elem is not None:
                    doi = doi_elem.text.strip()
                
                # Look for journal reference in arxiv:journal_ref
                journal_ref_elem = entry.find('arxiv:journal_ref', namespaces)
                if journal_ref_elem is not None:
                    journal_ref = journal_ref_elem.text.strip()
                
                # Extract links (PDF and abstract)
                pdf_url = None
                abs_url = None
                
                link_elems = entry.findall('atom:link', namespaces)
                for link_elem in link_elems:
                    href = link_elem.get('href')
                    title = link_elem.get('title')
                    rel = link_elem.get('rel')
                    
                    if title == 'pdf':
                        pdf_url = href
                    elif rel == 'alternate':
                        abs_url = href
                
                # If we didn't find PDF URL, construct it from the ID
                if not pdf_url and id_elem is not None:
                    arxiv_id = id_elem.text.split('/')[-1]  # Extract ID from full URL
                    pdf_url = f"http://arxiv.org/pdf/{arxiv_id}.pdf"
                
                # If we didn't find abstract URL, use the ID URL
                if not abs_url and id_elem is not None:
                    abs_url = id_elem.text
                
                # Create result object
                if id_elem is not None and title_elem is not None:
                    arxiv_id = id_elem.text.split('/')[-1]  # Extract ID from full URL
                    
                    search_results.append(ArxivSearchResult(
                        id=arxiv_id,
                        title=title_elem.text.strip() if title_elem.text else "",
                        authors=authors,
                        abstract=summary_elem.text.strip() if summary_elem is not None and summary_elem.text else None,
                        published=published_elem.text.strip() if published_elem is not None else "",
                        updated=updated_elem.text.strip() if updated_elem is not None and updated_elem.text else None,
                        doi=doi,
                        journal_ref=journal_ref,
                        categories=categories,
                        pdf_url=pdf_url or "",
                        abs_url=abs_url or ""
                    ))
                    
            except Exception as e:
                # Skip this entry if parsing fails
                continue
        
        return ArxivSearchResponse(
            results=search_results,
            total_results=total_results,
            search_time=time.time() - start_time
        )
        
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Network error while connecting to arXiv API: {str(e)}"
        )
    except Exception as e:
        import traceback
        print(f"ArXiv API Error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while searching arXiv: {str(e)}"
        )