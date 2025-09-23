from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import logging
import os
from app.core.dependencies import get_current_user
from typing import List, Dict, Any, Optional
import asyncio

# 로거 설정
logger = logging.getLogger(__name__)

# 라우터 생성
router = APIRouter()

# 보안 스키마
security = HTTPBearer()

# Semantic Scholar API 설정
SEMANTIC_SCHOLAR_BASE_URL = "https://api.semanticscholar.org/graph/v1"
TIMEOUT = 30.0

def verify_semantic_scholar_token():
    """Semantic Scholar API 키 검증 (선택사항)"""
    api_key = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
    # Semantic Scholar는 API 키가 선택사항이므로 경고만 로그
    if not api_key or api_key == "your_semantic_scholar_api_key_here":
        logger.warning("Semantic Scholar API 키가 설정되지 않았습니다. 공개 API를 사용합니다.")
        return None
    return api_key

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """토큰 검증 (현재는 간단한 검증)"""
    if not credentials.credentials:
        raise HTTPException(status_code=401, detail="Token required")
    return credentials.credentials

@router.get("/search")
async def search_semantic_scholar(
    query: str,
    offset: int = 0,
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """
    Semantic Scholar에서 논문 검색
    
    Args:
        query: 검색 쿼리
        offset: 검색 시작 위치 (기본값: 0)
        limit: 검색 결과 수 (기본값: 10, 최대 100)
        token: 인증 토큰
    
    Returns:
        검색 결과 리스트
    """
    try:
        # limit 제한
        if limit > 100:
            limit = 100
        
        # API 요청 URL 구성
        url = f"{SEMANTIC_SCHOLAR_BASE_URL}/paper/search"
        params = {
            "query": query,
            "offset": offset,
            "limit": limit,
            "fields": "paperId,title,authors,year,abstract,venue,citationCount,referenceCount,fieldsOfStudy,publicationDate,journal,doi,url"
        }
        
        logger.info(f"Semantic Scholar API 요청: {url} with params: {params}")
        
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url, params=params)
            
            logger.info(f"Semantic Scholar API 응답 상태: {response.status_code}")
            
            if response.status_code == 429:
                raise HTTPException(
                    status_code=429, 
                    detail="Rate limit exceeded. Please wait and try again or apply for an API key."
                )
            
            if response.status_code != 200:
                logger.error(f"Semantic Scholar API 오류: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Semantic Scholar API error: {response.text}"
                )
            
            data = response.json()
            logger.info(f"Semantic Scholar API 응답 데이터 수: {len(data.get('data', []))}")
            
            # 응답 데이터 변환
            results = []
            for paper in data.get('data', []):
                # 저자 정보 처리
                authors = []
                if paper.get('authors'):
                    authors = [author.get('name', 'Unknown') for author in paper['authors']]
                
                # 출판 정보 처리
                venue = paper.get('venue', '')
                journal = paper.get('journal', {})
                if journal and journal.get('name'):
                    venue = journal['name']
                
                # 필드 정보 처리
                fields = []
                if paper.get('fieldsOfStudy'):
                    fields = paper['fieldsOfStudy']
                
                result = {
                    "id": paper.get('paperId', ''),
                    "title": paper.get('title', 'No title'),
                    "author": ', '.join(authors) if authors else 'Unknown',
                    "year": str(paper.get('year', '')),
                    "publication": venue,
                    "abstract": paper.get('abstract', ''),
                    "doi": paper.get('doi', ''),
                    "url": paper.get('url', ''),
                    "citation_count": paper.get('citationCount', 0),
                    "reference_count": paper.get('referenceCount', 0),
                    "fields_of_study": fields,
                    "publication_date": paper.get('publicationDate', ''),
                    "source": "Semantic Scholar"
                }
                results.append(result)
            
            return {
                "results": results,
                "total_results": data.get('total', len(results)),
                "offset": offset,
                "limit": limit,
                "query": query
            }
            
    except httpx.TimeoutException:
        logger.error("Semantic Scholar API 타임아웃")
        raise HTTPException(status_code=408, detail="Request timeout")
    except httpx.RequestError as e:
        logger.error(f"Semantic Scholar API 요청 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")
    except Exception as e:
        logger.error(f"Semantic Scholar 검색 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/info")
async def get_semantic_scholar_info(current_user: dict = Depends(get_current_user)):
    """Semantic Scholar API 정보 반환"""
    try:
        api_key = verify_semantic_scholar_token()
        return {
            "service": "Semantic Scholar",
            "description": "AI-powered scientific literature search",
            "version": "1.0",
            "api_status": "configured" if api_key else "public_api",
            "supported_features": [
                "논문 검색",
                "저자 정보",
                "인용 정보",
                "DOI 지원",
                "오픈 액세스 정보"
            ]
        }
    except Exception as e:
        logger.error(f"Semantic Scholar info error: {str(e)}")
        return {
            "service": "Semantic Scholar",
            "description": "AI-powered scientific literature search",
            "version": "1.0",
            "api_status": "error",
            "error": str(e)
        }