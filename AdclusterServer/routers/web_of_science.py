import logging
from fastapi import APIRouter, HTTPException, Depends, Query
from app.core.dependencies import get_current_user
import requests
import os
from typing import Optional

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def verify_wos_token():
    """Web of Science API 토큰 검증"""
    api_key = os.getenv("WOS_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="Web of Science API 키가 설정되지 않았습니다. 환경변수 WOS_API_KEY를 설정해주세요."
        )
    return api_key

@router.get("/info")
async def get_wos_info(current_user: dict = Depends(get_current_user)):
    """Web of Science API 정보 반환"""
    try:
        api_key = verify_wos_token()
        return {
            "service": "Web of Science",
            "description": "Clarivate Web of Science 학술 데이터베이스 검색",
            "api_status": "configured" if api_key else "not_configured",
            "supported_features": [
                "논문 검색",
                "저자 정보",
                "인용 정보",
                "출판 정보",
                "DOI 지원"
            ]
        }
    except Exception as e:
        logger.error(f"Web of Science info error: {str(e)}")
        return {
            "service": "Web of Science",
            "description": "Clarivate Web of Science 학술 데이터베이스 검색",
            "api_status": "not_configured",
            "error": str(e)
        }

@router.get("/search")
async def search_wos(
    query: str = Query(..., description="검색 쿼리"),
    limit: int = Query(10, description="결과 개수", ge=1, le=100),
    page: int = Query(1, description="페이지 번호", ge=1),
    current_user: dict = Depends(get_current_user)
):
    """Web of Science에서 논문 검색"""
    try:
        logger.info(f"Web of Science search request - Query: {query}, Limit: {limit}, Page: {page}")
        
        # API 키 검증
        api_key = verify_wos_token()
        
        # Web of Science API 엔드포인트
        url = "https://api.clarivate.com/apis/wos-starter/v1/documents"
        
        # API 요청 파라미터
        params = {
            "query": query,
            "limit": limit,
            "page": page
        }
        
        # API 요청 헤더
        headers = {
            "X-ApiKey": api_key,
            "Content-Type": "application/json"
        }
        
        logger.info(f"Making request to Web of Science API: {url}")
        logger.info(f"Request params: {params}")
        
        # Web of Science API 호출
        response = requests.get(url, params=params, headers=headers, timeout=30)
        
        logger.info(f"Web of Science API response status: {response.status_code}")
        
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Web of Science API 키가 유효하지 않습니다.")
        elif response.status_code == 429:
            raise HTTPException(status_code=429, detail="Web of Science API 요청 한도를 초과했습니다.")
        elif response.status_code != 200:
            logger.error(f"Web of Science API error: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Web of Science API 오류: {response.status_code}"
            )
        
        # 응답 데이터 파싱
        data = response.json()
        logger.info(f"Web of Science API response received: {len(data.get('data', []))} results")
        
        # 결과 변환
        results = []
        documents = data.get('data', [])
        
        for doc in documents:
            # 저자 정보 처리
            authors = []
            if 'authors' in doc and doc['authors']:
                authors = [author.get('name', '') for author in doc['authors']]
            author_str = ', '.join(authors) if authors else 'Unknown author'
            
            # 출판 정보 처리
            publication = doc.get('source', {}).get('title', 'Unknown publication')
            
            # 연도 정보 처리
            year = ''
            if 'published_date' in doc:
                try:
                    year = str(doc['published_date'][:4]) if doc['published_date'] else ''
                except:
                    year = ''
            
            # DOI 정보 처리
            doi = None
            identifiers = doc.get('identifiers', {})
            if 'doi' in identifiers:
                doi = identifiers['doi']
            
            # URL 생성
            url = None
            if doi:
                url = f"https://doi.org/{doi}"
            elif 'ut' in identifiers:
                url = f"https://www.webofscience.com/wos/woscc/full-record/{identifiers['ut']}"
            
            result = {
                'id': doc.get('ut', '') or doc.get('id', ''),
                'title': doc.get('title', 'No title'),
                'author': author_str,
                'year': year,
                'publication': publication,
                'doi': doi,
                'abstract': doc.get('abstract', ''),
                'url': url
            }
            results.append(result)
        
        logger.info(f"Processed {len(results)} Web of Science results")
        
        return {
            "results": results,
            "total_results": data.get('found', len(results)),
            "search_time": data.get('time_taken', 0),
            "query": query,
            "page": page,
            "limit": limit
        }
        
    except HTTPException:
        raise
    except requests.exceptions.Timeout:
        logger.error("Web of Science API timeout")
        raise HTTPException(status_code=408, detail="Web of Science API 요청 시간 초과")
    except requests.exceptions.RequestException as e:
        logger.error(f"Web of Science API request error: {str(e)}")
        raise HTTPException(status_code=503, detail="Web of Science API 연결 오류")
    except Exception as e:
        logger.error(f"Web of Science search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Web of Science 검색 중 오류 발생: {str(e)}")