import os
import httpx
import xml.etree.ElementTree as ET
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from urllib.parse import quote

from app.schemas.kci import KciSearchResponse, KciArticleInfo, KciErrorResponse

router = APIRouter(prefix="/api/kci", tags=["KCI"])

# 환경 변수에서 API 키 가져오기
KCI_API_KEY = os.getenv("KCI_API_KEY")
KCI_BASE_URL = "https://open.kci.go.kr/po/openapi/openApiSearch.kci"

# 상수 정의
DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100


def parse_kci_xml_response(xml_content: str) -> KciSearchResponse:
    """KCI API XML 응답을 파싱하여 KciSearchResponse 객체로 변환"""
    try:
        root = ET.fromstring(xml_content)
        
        # 오류 응답 확인
        error_elements = root.findall(".//error") or root.findall(".//Error")
        if error_elements:
            error_msg = error_elements[0].text or "Unknown error"
            return KciSearchResponse(
                total_count=0,
                current_page=1,
                page_size=DEFAULT_PAGE_SIZE,
                articles=[],
                error_message=f"API 오류: {error_msg}"
            )
        
        # 메타데이터에서 총 개수, 현재 페이지, 페이지 크기 추출
        total_count = 0
        current_page = 1
        page_size = DEFAULT_PAGE_SIZE
        
        # inputData에서 요청 파라미터 추출
        input_data = root.find(".//inputData")
        if input_data is not None:
            page_elem = input_data.find(".//page")
            if page_elem is not None and page_elem.text:
                try:
                    current_page = int(page_elem.text)
                except ValueError:
                    pass
            
            display_count_elem = input_data.find(".//displayCount")
            if display_count_elem is not None and display_count_elem.text:
                try:
                    page_size = int(display_count_elem.text)
                except ValueError:
                    pass
        
        # outputData에서 전체 결과 수 추출
        output_data = root.find(".//outputData")
        if output_data is not None:
            result = output_data.find(".//result")
            if result is not None:
                total_elem = result.find(".//total")
                if total_elem is not None and total_elem.text:
                    try:
                        total_count = int(total_elem.text)
                    except ValueError:
                        pass
        
        # 논문 정보 추출
        articles = []
        
        # record 요소들 찾기 (KCI API는 record 구조 사용)
        record_elements = root.findall(".//record")
        
        for record_elem in record_elements:
            article_info = KciArticleInfo()
            
            # journalInfo에서 학술지 정보 추출
            journal_info = record_elem.find(".//journalInfo")
            if journal_info is not None:
                # 학술지명
                journal_name = journal_info.find(".//journal-name")
                if journal_name is not None and journal_name.text:
                    article_info.journal = journal_name.text.strip()
                
                # 출판사
                publisher_name = journal_info.find(".//publisher-name")
                if publisher_name is not None and publisher_name.text:
                    article_info.publisher = publisher_name.text.strip()
                
                # 출판년도
                pub_year = journal_info.find(".//pub-year")
                if pub_year is not None and pub_year.text:
                    article_info.year = pub_year.text.strip()
                
                # 볼륨
                volume = journal_info.find(".//volume")
                if volume is not None and volume.text:
                    article_info.vol = volume.text.strip()
                
                # 이슈
                issue = journal_info.find(".//issue")
                if issue is not None and issue.text:
                    article_info.no = issue.text.strip()
            
            # articleInfo에서 논문 정보 추출
            article_info_elem = record_elem.find(".//articleInfo")
            if article_info_elem is not None:
                # 제목 추출 (title-group 내의 article-title)
                title_group = article_info_elem.find(".//title-group")
                if title_group is not None:
                    article_titles = title_group.findall(".//article-title")
                    if article_titles:
                        # 첫 번째 제목 사용 (보통 한국어 제목)
                        article_info.title = article_titles[0].text.strip() if article_titles[0].text else None
                
                # 저자 추출 (author-group 내의 author들)
                author_group = article_info_elem.find(".//author-group")
                if author_group is not None:
                    authors = author_group.findall(".//author")
                    if authors:
                        author_names = []
                        for author in authors:
                            if author.text:
                                author_names.append(author.text.strip())
                        if author_names:
                            article_info.author = ", ".join(author_names)
                
                # 초록 추출 (abstract-group 내의 abstract)
                abstract_group = article_info_elem.find(".//abstract-group")
                if abstract_group is not None:
                    abstract_elem = abstract_group.find(".//abstract")
                    if abstract_elem is not None and abstract_elem.text:
                        article_info.abstract = abstract_elem.text.strip()
                
                # URL 추출
                url_elem = article_info_elem.find(".//url")
                if url_elem is not None and url_elem.text:
                    article_info.url = url_elem.text.strip()
                
                # DOI 추출
                doi_elem = article_info_elem.find(".//doi")
                if doi_elem is not None and doi_elem.text:
                    article_info.doi = doi_elem.text.strip()
                
                # UCI 추출
                uci_elem = article_info_elem.find(".//uci")
                if uci_elem is not None and uci_elem.text:
                    article_info.uci = uci_elem.text.strip()
                
                # 키워드 추출
                keyword_elem = article_info_elem.find(".//keyword")
                if keyword_elem is not None and keyword_elem.text:
                    article_info.keyword = keyword_elem.text.strip()
            
            articles.append(article_info)
        
        return KciSearchResponse(
            total_count=total_count,
            current_page=current_page,
            page_size=page_size,
            articles=articles
        )
        
    except ET.ParseError as e:
        return KciSearchResponse(
            total_count=0,
            current_page=1,
            page_size=DEFAULT_PAGE_SIZE,
            articles=[],
            error_message=f"XML 파싱 오류: {str(e)}"
        )
    except Exception as e:
        return KciSearchResponse(
            total_count=0,
            current_page=1,
            page_size=DEFAULT_PAGE_SIZE,
            articles=[],
            error_message=f"응답 처리 오류: {str(e)}"
        )


@router.get("/search", response_model=KciSearchResponse)
async def search_kci_articles(
    title: str = Query(..., description="검색할 논문 제목 키워드"),
    page: int = Query(1, ge=1, description="페이지 번호 (1부터 시작)"),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description="페이지당 결과 수")
):
    """
    KCI(한국학술정보) 논문 검색
    
    - **title**: 검색할 논문 제목 키워드
    - **page**: 페이지 번호 (기본값: 1)
    - **page_size**: 페이지당 결과 수 (기본값: 10, 최대: 100)
    """
    
    if not KCI_API_KEY:
        raise HTTPException(status_code=500, detail="KCI API 키가 설정되지 않았습니다")
    
    try:
        # URL 인코딩된 검색어
        encoded_title = quote(title)
        
        # API 요청 URL 구성
        url = f"{KCI_BASE_URL}?apiCode=articleSearch&key={KCI_API_KEY}&title={encoded_title}&page={page}&displayCount={page_size}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            
            # XML 응답 파싱
            result = parse_kci_xml_response(response.text)
            return result
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"KCI API 요청 실패: {e.response.status_code}"
        )
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"KCI API 연결 실패: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"검색 처리 중 오류 발생: {str(e)}")


@router.get("/health")
async def health_check():
    """KCI API 연결 상태 확인"""
    
    if not KCI_API_KEY:
        return {"status": "error", "message": "KCI API 키가 설정되지 않았습니다"}
    
    try:
        # 간단한 테스트 검색
        url = f"{KCI_BASE_URL}?apiCode=articleSearch&key={KCI_API_KEY}&title=test&page=1&displayCount=1"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            
            if response.status_code == 200:
                return {"status": "healthy", "message": "KCI API 연결 정상"}
            else:
                return {"status": "error", "message": f"KCI API 응답 오류: {response.status_code}"}
                
    except Exception as e:
        return {"status": "error", "message": f"KCI API 연결 실패: {str(e)}"}