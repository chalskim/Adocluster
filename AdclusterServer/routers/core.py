from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
import httpx
import logging
import os
from app.core.dependencies import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

# CORE API 설정
CORE_BASE_URL = "https://core.ac.uk/api-v2"

def verify_core_token():
    """CORE API 키 검증"""
    api_key = os.getenv("CORE_API_KEY")
    if not api_key or api_key == "your_core_api_key_here":
        logger.error("CORE API 키가 설정되지 않았습니다.")
        raise HTTPException(status_code=500, detail="CORE API 키가 설정되지 않았습니다.")
    return api_key

@router.get("/search")
async def search_core(
    query: str = Query(..., description="검색 쿼리"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지당 결과 수"),
    current_user: dict = Depends(get_current_user)
):
    """
    CORE API를 사용하여 학술 논문을 검색합니다.
    """
    try:
        logger.info(f"CORE 검색 요청: query={query}, page={page}, page_size={page_size}")
        
        # API 키 가져오기
        api_key = verify_core_token()
        
        # CORE API 엔드포인트 구성
        core_url = f"{CORE_BASE_URL}/articles/search/{query}"
        
        params = {
            "page": page,
            "pageSize": page_size,
            "apiKey": api_key
        }
        
        logger.info(f"CORE API 요청 URL: {core_url}")
        logger.info(f"CORE API 요청 파라미터: {params}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(core_url, params=params)
            
            logger.info(f"CORE API 응답 상태: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"CORE API 오류: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"CORE 검색 중 오류가 발생했습니다: {response.status_code}"
                )
            
            data = response.json()
            logger.info(f"CORE API 응답 데이터 키: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            # CORE API 응답을 표준 형식으로 변환
            results = []
            
            if isinstance(data, dict) and 'data' in data:
                articles = data['data']
                if isinstance(articles, list):
                    for article in articles:
                        if isinstance(article, dict):
                            # 저자 정보 처리
                            authors = []
                            if 'authors' in article and isinstance(article['authors'], list):
                                authors = [author.get('name', '') for author in article['authors'] if isinstance(author, dict)]
                            
                            # 출판 정보 처리
                            journal = ""
                            year = ""
                            if 'journals' in article and isinstance(article['journals'], list) and article['journals']:
                                journal = article['journals'][0].get('title', '')
                            
                            if 'yearPublished' in article:
                                year = str(article['yearPublished'])
                            elif 'publishedDate' in article:
                                try:
                                    year = article['publishedDate'][:4] if article['publishedDate'] else ""
                                except:
                                    year = ""
                            
                            # DOI 처리
                            doi = article.get('doi', '')
                            if doi and not doi.startswith('http'):
                                doi = f"https://doi.org/{doi}"
                            
                            result = {
                                "id": article.get('id', ''),
                                "title": article.get('title', 'No title'),
                                "authors": authors,
                                "year": year,
                                "journal": journal,
                                "abstract": article.get('abstract', ''),
                                "doi": doi,
                                "url": article.get('downloadUrl', ''),
                                "citation_count": article.get('citationCount', 0),
                                "source": "CORE"
                            }
                            results.append(result)
            
            # 총 결과 수 처리
            total_results = 0
            if isinstance(data, dict):
                total_results = data.get('totalHits', len(results))
            
            response_data = {
                "results": results,
                "total_results": total_results,
                "page": page,
                "page_size": page_size,
                "search_time": 0.0  # CORE API는 검색 시간을 제공하지 않음
            }
            
            logger.info(f"CORE 검색 완료: {len(results)}개 결과 반환")
            return response_data
            
    except httpx.TimeoutException:
        logger.error("CORE API 요청 시간 초과")
        raise HTTPException(status_code=504, detail="CORE API 요청 시간이 초과되었습니다.")
    except httpx.RequestError as e:
        logger.error(f"CORE API 요청 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CORE API 요청 중 오류가 발생했습니다: {str(e)}")
    except Exception as e:
        logger.error(f"CORE 검색 중 예상치 못한 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CORE 검색 중 오류가 발생했습니다: {str(e)}")

@router.get("/info")
async def get_core_info(current_user: dict = Depends(get_current_user)):
    """CORE API 정보 반환"""
    try:
        api_key = verify_core_token()
        return {
            "service": "CORE",
            "description": "Open access research papers aggregator",
            "version": "1.0",
            "api_status": "configured",
            "supported_features": [
                "논문 검색",
                "오픈 액세스 논문",
                "메타데이터 제공",
                "전문 텍스트 접근",
                "저자 정보"
            ]
        }
    except Exception as e:
        logger.error(f"CORE info error: {str(e)}")
        return {
            "service": "CORE",
            "description": "Open access research papers aggregator",
            "version": "1.0",
            "api_status": "error",
            "error": str(e)
        }