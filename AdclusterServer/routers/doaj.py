from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List, Dict, Any
import httpx
import logging
import os
from app.core.dependencies import get_current_user

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def verify_doaj_token():
    """DOAJ API 키 검증 (선택사항)"""
    api_key = os.getenv("DOAJ_API_KEY")
    # DOAJ는 API 키가 선택사항이므로 경고만 로그
    if not api_key or api_key == "your_doaj_api_key_here":
        logger.warning("DOAJ API 키가 설정되지 않았습니다. 공개 API를 사용합니다.")
        return None
    return api_key

@router.get("/search")
async def search_doaj(
    query: str = Query(..., description="검색 쿼리"),
    page: int = Query(1, ge=1, description="페이지 번호 (1부터 시작)"),
    page_size: int = Query(10, ge=1, le=100, description="페이지당 결과 수 (1-100)"),
    current_user: dict = Depends(get_current_user)
):
    """
    DOAJ (Directory of Open Access Journals) API를 사용하여 오픈 액세스 학술 논문을 검색합니다.
    
    Args:
        query: 검색할 키워드
        page: 페이지 번호 (기본값: 1)
        page_size: 페이지당 결과 수 (기본값: 10, 최대: 100)
        current_user: 인증된 사용자 정보
    
    Returns:
        DOAJ 검색 결과
    """
    try:
        # DOAJ API 호출 - 올바른 v4 엔드포인트 사용
        doaj_url = f"https://doaj.org/api/v4/search/articles/{query}"
        params = {
            "page": page,
            "pageSize": page_size
        }
        
        logger.info(f"DOAJ API 요청: {doaj_url} with params: {params}")
        
        # DOAJ API 호출
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                doaj_url,
                params=params,
                headers={
                    "Accept": "application/json",
                    "User-Agent": "ADOCluster/1.0"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # 응답 데이터 구조화
                formatted_results = []
                
                for article in data.get("results", []):
                    bibjson = article.get("bibjson", {})
                    
                    # 기본 정보 추출
                    title = bibjson.get("title", "제목 없음")
                    abstract = bibjson.get("abstract", "초록 없음")
                    
                    # 저자 정보 추출
                    authors = []
                    for author in bibjson.get("author", []):
                        author_name = author.get("name", "")
                        if author_name:
                            authors.append(author_name)
                    
                    # 저널 정보 추출
                    journal = bibjson.get("journal", {})
                    journal_title = journal.get("title", "저널 정보 없음")
                    
                    # 발행 정보 추출
                    year = bibjson.get("year", "")
                    month = bibjson.get("month", "")
                    volume = journal.get("volume", "")
                    number = journal.get("number", "")
                    
                    # DOI 및 URL 추출
                    doi = ""
                    pdf_url = ""
                    
                    for identifier in bibjson.get("identifier", []):
                        if identifier.get("type") == "doi":
                            doi = identifier.get("id", "")
                    
                    for link in bibjson.get("link", []):
                        if link.get("type") == "fulltext" and link.get("content_type") == "PDF":
                            pdf_url = link.get("url", "")
                    
                    # 키워드 추출
                    keywords = bibjson.get("keywords", [])
                    
                    # 주제 분류 추출
                    subjects = []
                    for subject in bibjson.get("subject", []):
                        if isinstance(subject, dict):
                            subjects.append(subject.get("term", ""))
                        else:
                            subjects.append(str(subject))
                    
                    formatted_article = {
                        "id": article.get("id", ""),
                        "title": title,
                        "authors": authors,
                        "abstract": abstract,
                        "journal": {
                            "title": journal_title,
                            "volume": volume,
                            "number": number,
                            "publisher": journal.get("publisher", ""),
                            "country": journal.get("country", ""),
                            "language": journal.get("language", [])
                        },
                        "publication_info": {
                            "year": year,
                            "month": month,
                            "pages": {
                                "start": bibjson.get("start_page", ""),
                                "end": bibjson.get("end_page", "")
                            }
                        },
                        "identifiers": {
                            "doi": doi,
                            "issn": journal.get("issns", [])
                        },
                        "links": {
                            "pdf": pdf_url,
                            "fulltext": [link.get("url", "") for link in bibjson.get("link", []) if link.get("type") == "fulltext"]
                        },
                        "keywords": keywords,
                        "subjects": subjects,
                        "last_updated": article.get("last_updated", ""),
                        "created_date": article.get("created_date", "")
                    }
                    
                    formatted_results.append(formatted_article)
                
                # 메타데이터 포함한 최종 응답
                result = {
                    "success": True,
                    "query": query,
                    "total_results": data.get("total", 0),
                    "page": data.get("page", page),
                    "page_size": data.get("pageSize", page_size),
                    "results_count": len(formatted_results),
                    "timestamp": data.get("timestamp", ""),
                    "results": formatted_results,
                    "pagination": {
                        "current_page": data.get("page", page),
                        "total_pages": (data.get("total", 0) + page_size - 1) // page_size,
                        "has_next": data.get("next") is not None,
                        "has_previous": page > 1,
                        "next_url": data.get("next", ""),
                        "last_url": data.get("last", "")
                    }
                }
                
                logger.info(f"DOAJ 검색 성공: {len(formatted_results)}개 결과 반환")
                return result
                
            else:
                logger.error(f"DOAJ API 오류: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"DOAJ API 요청 실패: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("DOAJ API 타임아웃")
        raise HTTPException(
            status_code=408,
            detail="DOAJ API 요청 시간 초과"
        )
    except httpx.RequestError as e:
        logger.error(f"DOAJ API 연결 오류: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"DOAJ API 연결 실패: {str(e)}"
        )
    except Exception as e:
        logger.error(f"DOAJ 검색 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"DOAJ 검색 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/info")
async def get_doaj_info(current_user: dict = Depends(get_current_user)):
    """
    DOAJ API 정보를 반환합니다.
    """
    return {
        "name": "DOAJ (Directory of Open Access Journals)",
        "description": "오픈 액세스 학술 저널 및 논문 검색 서비스",
        "base_url": "https://doaj.org/api/v2",
        "features": [
            "오픈 액세스 논문 검색",
            "저널 메타데이터 제공",
            "DOI 및 전문 링크 제공",
            "다국어 지원",
            "주제 분류 제공"
        ],
        "supported_formats": ["JSON"],
        "rate_limits": "제한 없음 (공개 API)",
        "documentation": "https://doaj.org/api/v2/docs"
    }