from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import xml.etree.ElementTree as ET
import os
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/pubmed",
    tags=["pubmed"],
    dependencies=[Depends(get_current_user)],
)

# Pydantic models for request/response
class PubMedSearchResult(BaseModel):
    pmid: str
    title: str
    authors: Optional[List[str]]
    journal: Optional[str]
    publication_date: Optional[str]
    abstract: Optional[str]
    doi: Optional[str]
    url: Optional[str]

class PubMedSearchResponse(BaseModel):
    results: List[PubMedSearchResult]
    total_results: int
    search_time: float

@router.get("/search", response_model=PubMedSearchResponse)
async def search_pubmed(
    query: str = Query(..., min_length=1, description="Search query for PubMed"),
    limit: int = Query(10, ge=1, le=100, description="Number of results to return (1-100)"),
    offset: int = Query(0, ge=0, description="Number of results to skip for pagination"),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Search PubMed using NCBI E-utilities API
    
    Args:
        query: Search query string
        limit: Number of results to return (1-100)
        offset: Number of results to skip for pagination
        current_user: Authenticated user (automatically injected)
        
    Returns:
        PubMedSearchResponse: Search results from PubMed
    """
    
    try:
        import time
        start_time = time.time()
        
        # Step 1: Search for PMIDs using esearch
        # URL format: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi
        # ?db=pubmed&term=검색어&retmode=json&retmax=가져올_갯수&retstart=시작위치&api_key=발급받은_API_KEY
        esearch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        esearch_params = {
            "db": "pubmed",
            "term": query,
            "retmode": "json",
            "retmax": limit,
            "retstart": offset
        }
        
        # Add API key if available
        pubmed_api_key = os.getenv("PUBMED_KEY")
        if pubmed_api_key:
            esearch_params["api_key"] = pubmed_api_key
        
        async with httpx.AsyncClient() as client:
            esearch_response = await client.get(esearch_url, params=esearch_params)
            
        if esearch_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"PubMed esearch API request failed with status {esearch_response.status_code}"
            )
        
        # Parse esearch JSON response
        esearch_data = esearch_response.json()
        esearch_result = esearch_data.get("esearchresult", {})
        pmids = esearch_result.get("idlist", [])
        total_results = int(esearch_result.get("count", 0))
        
        if not pmids:
            return PubMedSearchResponse(
                results=[],
                total_results=0,
                search_time=time.time() - start_time
            )
        
        # Step 2: Fetch detailed information using efetch
        efetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
        efetch_params = {
            "db": "pubmed",
            "id": ",".join(pmids),
            "retmode": "xml"
        }
        
        # Add API key if available
        if pubmed_api_key:
            efetch_params["api_key"] = pubmed_api_key
        
        async with httpx.AsyncClient() as client:
            efetch_response = await client.get(efetch_url, params=efetch_params)
            
        if efetch_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"PubMed efetch API request failed with status {efetch_response.status_code}"
            )
        
        # Parse efetch XML response
        efetch_root = ET.fromstring(efetch_response.text)
        search_results = []
        
        for article in efetch_root.findall(".//PubmedArticle"):
            try:
                # Extract PMID
                pmid_elem = article.find(".//PMID")
                pmid = pmid_elem.text if pmid_elem is not None else ""
                
                # Extract title
                title_elem = article.find(".//ArticleTitle")
                title = title_elem.text if title_elem is not None else ""
                
                # Extract authors
                authors = []
                author_list = article.findall(".//Author")
                for author in author_list:
                    last_name = author.find("LastName")
                    fore_name = author.find("ForeName")
                    if last_name is not None and fore_name is not None:
                        authors.append(f"{fore_name.text} {last_name.text}")
                    elif last_name is not None:
                        authors.append(last_name.text)
                
                # Extract journal
                journal_elem = article.find(".//Journal/Title")
                journal = journal_elem.text if journal_elem is not None else None
                
                # Extract publication date
                pub_date_elem = article.find(".//PubDate")
                publication_date = None
                if pub_date_elem is not None:
                    year = pub_date_elem.find("Year")
                    month = pub_date_elem.find("Month")
                    day = pub_date_elem.find("Day")
                    
                    date_parts = []
                    if year is not None:
                        date_parts.append(year.text)
                    if month is not None:
                        date_parts.append(month.text)
                    if day is not None:
                        date_parts.append(day.text)
                    
                    if date_parts:
                        publication_date = "-".join(date_parts)
                
                # Extract abstract
                abstract_elem = article.find(".//Abstract/AbstractText")
                abstract = abstract_elem.text if abstract_elem is not None else None
                
                # Extract DOI
                doi = None
                article_ids = article.findall(".//ArticleId")
                for article_id in article_ids:
                    if article_id.get("IdType") == "doi":
                        doi = article_id.text
                        break
                
                # Create URL
                url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None
                
                search_results.append(PubMedSearchResult(
                    pmid=pmid,
                    title=title,
                    authors=authors if authors else None,
                    journal=journal,
                    publication_date=publication_date,
                    abstract=abstract,
                    doi=doi,
                    url=url
                ))
                
            except Exception as e:
                # Skip this article if parsing fails
                continue
        
        return PubMedSearchResponse(
            results=search_results,
            total_results=total_results,
            search_time=time.time() - start_time
        )
        
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Network error while connecting to PubMed API: {str(e)}"
        )
    except ET.ParseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing PubMed XML response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while searching PubMed: {str(e)}"
        )