import logging
import requests
import os
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.dependencies import get_current_user
from typing import Optional, Dict, Any, List

# 로거 설정
logger = logging.getLogger(__name__)

# 라우터 생성
router = APIRouter()
security = HTTPBearer()

# Scopus API 키 검증 함수
def verify_scopus_token():
    """Scopus API 키 검증"""
    api_key = os.getenv("SCOPUS_API_KEY")
    if not api_key or api_key == "your_scopus_api_key_here":
        raise HTTPException(
            status_code=500, 
            detail="Scopus API 키가 설정되지 않았습니다. 환경변수 SCOPUS_API_KEY를 설정해주세요."
        )
    return api_key

# 인증 토큰 검증 함수 (기존 호환성 유지)
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=401, detail="인증 토큰이 필요합니다.")
    return token

@router.get("/info")
async def get_scopus_info(current_user: dict = Depends(get_current_user)):
    """Scopus 서비스 정보를 반환합니다."""
    try:
        api_key = verify_scopus_token()
        return {
            "service": "Scopus",
            "description": "Elsevier Scopus 학술 데이터베이스 검색 서비스",
            "version": "1.0",
            "api_status": "configured" if api_key else "not_configured",
            "supported_features": [
                "논문 검색",
                "저자 정보",
                "인용 정보",
                "DOI 지원",
                "페이지네이션"
            ]
        }
    except Exception as e:
        logger.error(f"Scopus info error: {str(e)}")
        return {
            "service": "Scopus",
            "description": "Elsevier Scopus 학술 데이터베이스 검색 서비스",
            "version": "1.0",
            "api_status": "not_configured",
            "error": str(e)
        }

@router.get("/search")
async def search_scopus(
    query: str = Query(..., description="검색어"),
    count: int = Query(10, description="결과 개수", ge=1, le=25),
    start: int = Query(0, description="시작 인덱스", ge=0),
    current_user: dict = Depends(get_current_user)
):
    """Scopus에서 논문을 검색합니다."""
    try:
        logger.info(f"Scopus 검색 요청: query={query}, count={count}, start={start}")
        
        # Scopus API 키 환경변수에서 가져오기
        api_key = verify_scopus_token()
        
        # Scopus API URL 구성
        url = f"https://api.elsevier.com/content/search/scopus"
        
        # 요청 헤더 설정
        headers = {
            'X-ELS-APIKey': api_key,
            'Accept': 'application/json'
        }
        
        # 요청 파라미터 설정
        params = {
            'query': query,
            'count': count,
            'start': start
        }
        
        # API 키가 설정되지 않은 경우 더미 데이터 반환
        if api_key == "YOUR_SCOPUS_API_KEY":
            logger.warning("Scopus API 키가 설정되지 않음. 더미 데이터를 반환합니다.")
            
            # 더미 응답 데이터 생성
            dummy_results = []
            for i in range(min(count, 5)):  # 최대 5개의 더미 결과
                dummy_results.append({
                    "id": f"scopus_{i+1}",
                    "title": f"{query} 관련 연구 논문 {i+1}",
                    "author": f"Author {i+1}, Co-Author {i+1}",
                    "year": str(2024 - i),
                    "publication": f"Journal of {query.title()} Research",
                    "doi": f"10.1016/j.example.2024.{i+1:03d}",
                    "abstract": f"This paper presents a comprehensive study on {query}. The research methodology includes...",
                    "url": f"https://www.scopus.com/record/display.uri?eid=2-s2.0-{85000000000 + i}",
                    "citation_count": 50 - i * 5,
                    "source_type": "Journal",
                    "publisher": "Elsevier"
                })
            
            return {
                "results": dummy_results,
                "total_results": len(dummy_results),
                "search_time": 0.5,
                "query": query,
                "start": start,
                "count": count,
                "note": "더미 데이터입니다. 실제 Scopus API를 사용하려면 API 키를 설정하세요."
            }
        
        # 실제 API 호출
        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # 응답 데이터 파싱
                results = []
                if 'search-results' in data and 'entry' in data['search-results']:
                    for entry in data['search-results']['entry']:
                        # 안전한 데이터 추출
                        title = entry.get('dc:title', 'No title')
                        authors = entry.get('dc:creator', 'Unknown author')
                        year = entry.get('prism:coverDate', '')[:4] if entry.get('prism:coverDate') else ''
                        publication = entry.get('prism:publicationName', 'Unknown publication')
                        doi = entry.get('prism:doi', '')
                        abstract = entry.get('dc:description', '')
                        
                        # URL 추출
                        url = ''
                        if 'link' in entry and len(entry['link']) > 0:
                            url = entry['link'][0].get('@href', '')
                        
                        # 인용 수 추출
                        citation_count = entry.get('citedby-count', 0)
                        
                        results.append({
                            "id": entry.get('eid', f"scopus_{len(results)}"),
                            "title": title,
                            "author": authors,
                            "year": year,
                            "publication": publication,
                            "doi": doi,
                            "abstract": abstract,
                            "url": url,
                            "citation_count": citation_count,
                            "source_type": entry.get('subtypeDescription', 'Article'),
                            "publisher": entry.get('prism:publisher', '')
                        })
                
                total_results = int(data.get('search-results', {}).get('opensearch:totalResults', 0))
                
                return {
                    "results": results,
                    "total_results": total_results,
                    "search_time": 1.0,
                    "query": query,
                    "start": start,
                    "count": count
                }
            
            elif response.status_code == 401:
                raise HTTPException(status_code=401, detail="Scopus API 인증 실패. API 키를 확인하세요.")
            elif response.status_code == 429:
                raise HTTPException(status_code=429, detail="Scopus API 요청 한도 초과. 잠시 후 다시 시도하세요.")
            else:
                logger.error(f"Scopus API 오류: {response.status_code} - {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"Scopus API 오류: {response.text}")
                
        except requests.exceptions.Timeout:
            raise HTTPException(status_code=408, detail="Scopus API 요청 시간 초과")
        except requests.exceptions.RequestException as e:
            logger.error(f"Scopus API 요청 오류: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Scopus API 요청 오류: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Scopus 검색 중 예상치 못한 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"검색 중 오류가 발생했습니다: {str(e)}")