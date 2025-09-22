from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import json
import time
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from app.schemas.acm import (
    ACMSearchResult, ACMSearchResponse, ACMQuery, ACMError,
    ACMAuthor, ACMDate, ACMJournal
)

router = APIRouter(
    prefix="/api/acm",
    tags=["acm"],
)

def parse_crossref_author(author_data: dict) -> ACMAuthor:
    """CrossRef API 저자 데이터를 ACMAuthor로 변환"""
    given = author_data.get("given", "")
    family = author_data.get("family", "")
    
    # 전체 이름 생성
    name_parts = []
    if given:
        name_parts.append(given)
    if family:
        name_parts.append(family)
    full_name = " ".join(name_parts) if name_parts else None
    
    return ACMAuthor(
        given=given or None,
        family=family or None,
        name=full_name
    )

def parse_crossref_date(date_data: dict) -> Optional[ACMDate]:
    """CrossRef API 날짜 데이터를 ACMDate로 변환"""
    if not date_data:
        return None
    
    return ACMDate(
        date_parts=date_data.get("date-parts"),
        date_time=date_data.get("date-time"),
        timestamp=date_data.get("timestamp")
    )

def parse_crossref_work(work: dict) -> ACMSearchResult:
    """CrossRef API work 데이터를 ACMSearchResult로 변환"""
    
    # 저자 정보 파싱
    authors = []
    if "author" in work:
        for author_data in work["author"]:
            authors.append(parse_crossref_author(author_data))
    
    # 날짜 정보 파싱
    published_print = parse_crossref_date(work.get("published-print"))
    published_online = parse_crossref_date(work.get("published-online"))
    
    # 제목에서 첫 번째 요소 추출 (리스트 형태로 제공됨)
    title_list = work.get("title", [])
    title = title_list[0] if title_list else None
    
    # 컨테이너 제목 (저널/컨퍼런스명)
    container_title = work.get("container-title", [])
    
    # URL 생성 (DOI 기반)
    doi = work.get("DOI")
    url = f"https://doi.org/{doi}" if doi else work.get("URL")
    
    # 페이지 정보
    page = work.get("page")
    
    return ACMSearchResult(
        doi=doi,
        title=title_list,
        authors=authors,
        container_title=container_title,
        published_print=published_print,
        published_online=published_online,
        abstract=work.get("abstract"),  # CrossRef에서는 보통 제공되지 않음
        url=url,
        page=page,
        volume=work.get("volume"),
        issue=work.get("issue"),
        publisher=work.get("publisher"),
        type=work.get("type"),
        subject=work.get("subject"),
        is_referenced_by_count=work.get("is-referenced-by-count", 0),
        references_count=work.get("references-count", 0),
        score=work.get("score", 0.0)
    )

@router.get("/search", response_model=ACMSearchResponse)
async def search_acm(
    query: str = Query(..., min_length=1, description="Search query for ACM Digital Library via CrossRef"),
    max_records: int = Query(20, ge=1, le=1000, description="Number of results to return per page (1-1000)"),
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    publisher: Optional[str] = Query("ACM", description="Publisher filter (default: ACM)"),
    from_year: Optional[int] = Query(None, description="Start year for publication date filter"),
    until_year: Optional[int] = Query(None, description="End year for publication date filter"),
    type_filter: Optional[str] = Query(None, description="Publication type filter (journal-article, proceedings-article, etc.)")
):
    """
    Search ACM Digital Library using CrossRef API
    
    CrossRef API를 통해 ACM에서 발행한 논문을 검색합니다.
    
    Args:
        query: 검색어
        max_records: 페이지당 결과 수 (1-1000)
        page: 페이지 번호 (1부터 시작)
        publisher: 출판사 필터 (기본값: ACM)
        from_year: 시작 연도
        until_year: 종료 연도
        type_filter: 논문 타입 필터
        
    Returns:
        ACMSearchResponse: 검색 결과
        
    Example:
        GET /api/acm/search?query=machine+learning&max_records=20&page=1
    """
    
    start_time = time.time()
    
    try:
        # CrossRef API 엔드포인트
        base_url = "https://api.crossref.org/works"
        
        # 페이지네이션 계산 (CrossRef는 offset 기반)
        offset = (page - 1) * max_records
        
        # 쿼리 파라미터 구성
        params = {
            "query": query,
            "rows": max_records,
            "offset": offset,
            "sort": "relevance",  # 관련도순 정렬
            "order": "desc"
        }
        
        # 출판사 필터 추가
        if publisher:
            params["query.publisher-name"] = publisher
            
        # 연도 필터 추가
        if from_year:
            params["filter"] = f"from-pub-date:{from_year}"
        if until_year:
            if "filter" in params:
                params["filter"] += f",until-pub-date:{until_year}"
            else:
                params["filter"] = f"until-pub-date:{until_year}"
                
        # 타입 필터 추가
        if type_filter:
            if "filter" in params:
                params["filter"] += f",type:{type_filter}"
            else:
                params["filter"] = f"type:{type_filter}"
        
        # 개발 모드: 모의 데이터 반환
        if publisher == "TEST" or query.lower() == "test":
            mock_results = []
            for i in range(min(max_records, 5)):
                mock_authors = [
                    ACMAuthor(given="John", family="Doe", name="John Doe"),
                    ACMAuthor(given="Jane", family="Smith", name="Jane Smith")
                ]
                
                mock_results.append(ACMSearchResult(
                    doi=f"10.1145/test.{i+1}",
                    title=[f"Mock ACM Article {i+1}: {query}"],
                    authors=mock_authors,
                    container_title=["ACM Test Conference"],
                    published_print=ACMDate(date_parts=[[2023, 6, 15]]),
                    abstract=f"This is a mock abstract for testing ACM API integration with query: {query}",
                    url=f"https://doi.org/10.1145/test.{i+1}",
                    page=f"{i*10 + 1}-{i*10 + 10}",
                    volume="1",
                    issue=str(i+1),
                    publisher="ACM",
                    type="proceedings-article",
                    is_referenced_by_count=10 + i,
                    references_count=20 + i,
                    score=0.9 - i * 0.1
                ))
            
            total_pages = (100 + max_records - 1) // max_records
            
            return ACMSearchResponse(
                results=mock_results,
                total_results=100,
                search_time=time.time() - start_time,
                current_page=page,
                total_pages=total_pages,
                status="ok",
                message_type="work-list",
                message_version="1.0.0"
            )
        
        # CrossRef API 호출
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # CrossRef API 응답 구조 확인
            if "message" not in data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Invalid response format from CrossRef API"
                )
            
            message = data["message"]
            works = message.get("items", [])
            total_results = message.get("total-results", 0)
            
            # 결과 파싱
            results = []
            for work in works:
                try:
                    parsed_result = parse_crossref_work(work)
                    results.append(parsed_result)
                except Exception as e:
                    # 개별 논문 파싱 오류는 로그만 남기고 계속 진행
                    print(f"Error parsing work: {e}")
                    continue
            
            # 총 페이지 수 계산
            total_pages = (total_results + max_records - 1) // max_records
            
            return ACMSearchResponse(
                results=results,
                total_results=total_results,
                search_time=time.time() - start_time,
                current_page=page,
                total_pages=total_pages,
                status=data.get("status", "ok"),
                message_type=data.get("message-type", "work-list"),
                message_version=data.get("message-version", "1.0.0")
            )
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"CrossRef API error: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to connect to CrossRef API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while searching ACM: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """ACM 라우터 상태 확인"""
    return {
        "status": "healthy",
        "service": "ACM Search via CrossRef API",
        "timestamp": time.time()
    }