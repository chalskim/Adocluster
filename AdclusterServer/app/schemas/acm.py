from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ACMAuthor(BaseModel):
    """ACM 논문 저자 정보"""
    given: Optional[str] = None
    family: Optional[str] = None
    name: Optional[str] = None  # 전체 이름

class ACMDate(BaseModel):
    """ACM 논문 날짜 정보"""
    date_parts: Optional[List[List[int]]] = None
    date_time: Optional[str] = None
    timestamp: Optional[int] = None

class ACMJournal(BaseModel):
    """ACM 저널/컨퍼런스 정보"""
    title: Optional[List[str]] = None
    short_title: Optional[List[str]] = None
    issn: Optional[List[str]] = None

class ACMSearchResult(BaseModel):
    """ACM 검색 결과 개별 논문 정보"""
    doi: Optional[str] = None
    title: Optional[List[str]] = None
    authors: Optional[List[ACMAuthor]] = None
    container_title: Optional[List[str]] = None  # 저널/컨퍼런스명
    published_print: Optional[ACMDate] = None
    published_online: Optional[ACMDate] = None
    abstract: Optional[str] = None
    url: Optional[str] = None
    page: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    publisher: Optional[str] = None
    type: Optional[str] = None  # 논문 타입 (journal-article, proceedings-article 등)
    subject: Optional[List[str]] = None  # 주제 분야
    
    # 추가 메타데이터
    is_referenced_by_count: Optional[int] = Field(default=0, description="인용 횟수")
    references_count: Optional[int] = Field(default=0, description="참고문헌 수")
    score: Optional[float] = Field(default=0.0, description="검색 관련도 점수")

class ACMQuery(BaseModel):
    """ACM 검색 쿼리 파라미터"""
    query: str = Field(..., description="검색어", min_length=1)
    max_records: int = Field(default=20, description="최대 결과 수 (1-1000)", ge=1, le=1000)
    page: int = Field(default=1, description="페이지 번호 (1부터 시작)", ge=1)
    
    # 추가 필터 옵션
    publisher: Optional[str] = Field(default=None, description="출판사 필터 (예: ACM)")
    from_year: Optional[int] = Field(default=None, description="시작 연도", ge=1900)
    until_year: Optional[int] = Field(default=None, description="종료 연도", le=2030)
    type_filter: Optional[str] = Field(default=None, description="논문 타입 필터")

class ACMSearchResponse(BaseModel):
    """ACM 검색 응답"""
    results: List[ACMSearchResult]
    total_results: int = Field(description="전체 결과 수")
    search_time: float = Field(description="검색 소요 시간 (초)")
    current_page: int = Field(description="현재 페이지")
    total_pages: int = Field(description="전체 페이지 수")
    
    # CrossRef API 메타데이터
    status: str = Field(default="ok", description="API 응답 상태")
    message_type: str = Field(default="work-list", description="응답 메시지 타입")
    message_version: str = Field(default="1.0.0", description="API 버전")

class ACMError(BaseModel):
    """ACM API 오류 응답"""
    error: str
    message: str
    status_code: int = 500