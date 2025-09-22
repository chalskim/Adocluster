from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import httpx
import asyncio
from datetime import datetime
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/crossref", tags=["crossref"])

# Crossref API 기본 설정
CROSSREF_BASE_URL = "https://api.crossref.org/works"
DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 50

# ACM Member ID
ACM_MEMBER_ID = "320"

class CrossrefSearchResult:
    def __init__(self, item: Dict[str, Any]):
        self.doi = item.get("DOI", "")
        self.title = self._extract_title(item)
        self.authors = self._extract_authors(item)
        self.publisher = item.get("publisher", "")
        self.publication_year = self._extract_year(item)
        self.journal = self._extract_journal(item)
        self.abstract = self._extract_abstract(item)
        self.url = f"https://doi.org/{self.doi}" if self.doi else ""
        self.citation_count = item.get("is-referenced-by-count", 0)
        self.type = item.get("type", "")
        
    def _extract_title(self, item: Dict[str, Any]) -> str:
        """제목 추출"""
        titles = item.get("title", [])
        return titles[0] if titles else ""
    
    def _extract_authors(self, item: Dict[str, Any]) -> List[str]:
        """저자 목록 추출"""
        authors = []
        author_list = item.get("author", [])
        for author in author_list:
            given = author.get("given", "")
            family = author.get("family", "")
            if given and family:
                authors.append(f"{given} {family}")
            elif family:
                authors.append(family)
        return authors
    
    def _extract_year(self, item: Dict[str, Any]) -> Optional[int]:
        """발행 연도 추출"""
        # 여러 날짜 필드 중에서 연도 추출 시도
        date_fields = ["published-print", "published-online", "created", "deposited"]
        for field in date_fields:
            date_info = item.get(field)
            if date_info and "date-parts" in date_info:
                date_parts = date_info["date-parts"]
                if date_parts and len(date_parts[0]) > 0:
                    return date_parts[0][0]
        return None
    
    def _extract_journal(self, item: Dict[str, Any]) -> str:
        """저널/학회지 이름 추출"""
        container_titles = item.get("container-title", [])
        return container_titles[0] if container_titles else ""
    
    def _extract_abstract(self, item: Dict[str, Any]) -> str:
        """초록 추출 (있는 경우)"""
        abstract = item.get("abstract", "")
        if abstract:
            # JATS XML 태그 제거
            import re
            abstract = re.sub(r'<[^>]+>', '', abstract)
        return abstract
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "id": self.doi,
            "title": self.title,
            "authors": self.authors,
            "publisher": self.publisher,
            "publication_year": self.publication_year,
            "journal": self.journal,
            "abstract": self.abstract,
            "doi": self.doi,
            "url": self.url,
            "citation_count": self.citation_count,
            "type": self.type
        }

class CrossrefSearchResponse:
    def __init__(self, results: List[CrossrefSearchResult], total_results: int, search_time: float):
        self.results = results
        self.total_results = total_results
        self.search_time = search_time
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "results": [result.to_dict() for result in self.results],
            "total_results": self.total_results,
            "search_time": self.search_time
        }

async def search_crossref_api(
    query: str,
    member_id: Optional[str] = None,
    rows: int = DEFAULT_PAGE_SIZE,
    offset: int = 0,
    author: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None
) -> CrossrefSearchResponse:
    """
    Crossref API를 사용하여 학술 자료 검색
    """
    start_time = datetime.now()
    
    # 쿼리 파라미터 구성
    params = {
        "rows": min(rows, MAX_PAGE_SIZE),
        "offset": offset
    }
    
    # 필터 조건 구성
    filters = []
    if member_id:
        filters.append(f"member:{member_id}")
    
    if year_from and year_to:
        filters.append(f"from-pub-date:{year_from},until-pub-date:{year_to}")
    elif year_from:
        filters.append(f"from-pub-date:{year_from}")
    elif year_to:
        filters.append(f"until-pub-date:{year_to}")
    
    if filters:
        params["filter"] = ",".join(filters)
    
    # 검색 쿼리 설정
    if author:
        params["query.author"] = author
    if query:
        if author:
            params["query"] = query
        else:
            params["query"] = query
    
    logger.info(f"Crossref API 요청: {CROSSREF_BASE_URL}, 파라미터: {params}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(CROSSREF_BASE_URL, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # 응답 데이터 파싱
            message = data.get("message", {})
            items = message.get("items", [])
            total_results = message.get("total-results", 0)
            
            # 검색 결과 변환
            results = []
            for item in items:
                try:
                    result = CrossrefSearchResult(item)
                    results.append(result)
                except Exception as e:
                    logger.warning(f"결과 파싱 오류: {e}")
                    continue
            
            search_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"Crossref 검색 완료: {len(results)}개 결과, 전체 {total_results}개, {search_time:.2f}초")
            
            return CrossrefSearchResponse(results, total_results, search_time)
            
    except httpx.HTTPError as e:
        logger.error(f"Crossref API 요청 오류: {e}")
        raise HTTPException(status_code=500, detail=f"Crossref API 요청 실패: {str(e)}")
    except Exception as e:
        logger.error(f"예상치 못한 오류: {e}")
        raise HTTPException(status_code=500, detail=f"검색 중 오류 발생: {str(e)}")

@router.get("/search")
async def search_crossref(
    query: str = Query(..., description="검색 키워드"),
    source: str = Query("all", description="검색 소스 (all, acm)"),
    author: Optional[str] = Query(None, description="저자명"),
    year_from: Optional[int] = Query(None, description="시작 연도"),
    year_to: Optional[int] = Query(None, description="종료 연도"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description="페이지 크기")
):
    """
    Crossref API를 사용한 학술 자료 검색
    
    - **query**: 검색할 키워드
    - **source**: 검색 소스 (all: 전체, acm: ACM만)
    - **author**: 저자명 (선택사항)
    - **year_from**: 시작 연도 (선택사항)
    - **year_to**: 종료 연도 (선택사항)
    - **page**: 페이지 번호 (1부터 시작)
    - **page_size**: 페이지당 결과 수 (최대 50)
    """
    
    if not query.strip():
        raise HTTPException(status_code=400, detail="검색 키워드가 필요합니다")
    
    # 페이지네이션 계산
    offset = (page - 1) * page_size
    
    # 소스별 member_id 설정
    member_id = None
    if source.lower() == "acm":
        member_id = ACM_MEMBER_ID
    
    try:
        result = await search_crossref_api(
            query=query,
            member_id=member_id,
            rows=page_size,
            offset=offset,
            author=author,
            year_from=year_from,
            year_to=year_to
        )
        
        return result.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"검색 처리 중 오류: {e}")
        raise HTTPException(status_code=500, detail="검색 처리 중 오류가 발생했습니다")

@router.get("/health")
async def health_check():
    """Crossref API 서비스 상태 확인"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{CROSSREF_BASE_URL}?rows=1")
            response.raise_for_status()
            return {"status": "healthy", "crossref_api": "accessible"}
    except Exception as e:
        logger.error(f"Crossref API 상태 확인 실패: {e}")
        return {"status": "unhealthy", "crossref_api": "inaccessible", "error": str(e)}