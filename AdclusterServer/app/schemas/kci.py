from pydantic import BaseModel
from typing import List, Optional


class KciArticleInfo(BaseModel):
    """KCI 논문 정보 스키마"""
    title: Optional[str] = None
    author: Optional[str] = None
    affiliation: Optional[str] = None
    journal: Optional[str] = None
    vol: Optional[str] = None
    no: Optional[str] = None
    pp: Optional[str] = None
    year: Optional[str] = None
    language: Optional[str] = None
    db: Optional[str] = None
    publisher: Optional[str] = None
    issn: Optional[str] = None
    subject: Optional[str] = None
    kdc: Optional[str] = None
    keyword: Optional[str] = None
    abstract: Optional[str] = None
    fpage: Optional[str] = None
    lpage: Optional[str] = None
    doi: Optional[str] = None
    uci: Optional[str] = None
    citation_count: Optional[str] = None
    url: Optional[str] = None
    verified: Optional[str] = None


class KciSearchResponse(BaseModel):
    """KCI 검색 응답 스키마"""
    total_count: int = 0
    current_page: int = 1
    page_size: int = 10
    articles: List[KciArticleInfo] = []
    error_message: Optional[str] = None


class KciErrorResponse(BaseModel):
    """KCI API 오류 응답 스키마"""
    error_code: Optional[str] = None
    error_message: str