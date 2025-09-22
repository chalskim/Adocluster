from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class NalibSearchItem(BaseModel):
    """국회도서관 검색 결과 개별 항목"""
    title: Optional[str] = None  # 자료명
    author: Optional[str] = None  # 저자
    publisher: Optional[str] = None  # 출판사
    pub_year: Optional[str] = None  # 출판년도
    isbn: Optional[str] = None  # ISBN
    call_no: Optional[str] = None  # 청구기호
    material_type: Optional[str] = None  # 자료유형
    location: Optional[str] = None  # 소장위치
    url: Optional[str] = None  # 상세보기 URL
    abstract: Optional[str] = None  # 초록/요약


class NalibSearchResponse(BaseModel):
    """국회도서관 검색 API 응답"""
    total_count: int = 0  # 전체 검색 결과 수
    current_page: int = 1  # 현재 페이지
    page_size: int = 10  # 페이지당 결과 수
    total_pages: int = 0  # 전체 페이지 수
    items: List[NalibSearchItem] = []  # 검색 결과 목록
    search_query: str = ""  # 검색어
    search_time: Optional[datetime] = None  # 검색 시간
    error_message: Optional[str] = None  # 오류 메시지 (있는 경우)


class NalibSearchRequest(BaseModel):
    """국회도서관 검색 요청"""
    query: str  # 검색어 (필수)
    page: int = 1  # 페이지 번호 (기본값: 1)
    page_size: int = 10  # 페이지당 결과 수 (기본값: 10, 최대: 100)
    search_target: Optional[str] = "전체"  # 검색 대상 (전체, 자료명, 저자, 출판사 등)


class NalibErrorResponse(BaseModel):
    """국회도서관 API 오류 응답"""
    error_message: str
    error_code: Optional[str] = None
    return_reason_code: Optional[str] = None