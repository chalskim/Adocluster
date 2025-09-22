from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import httpx
import xml.etree.ElementTree as ET
import os
from datetime import datetime
import urllib.parse

from app.schemas.nalib import (
    NalibSearchResponse, 
    NalibSearchItem, 
    NalibSearchRequest,
    NalibErrorResponse
)

router = APIRouter(prefix="/api/nalib", tags=["nalib"])

# 환경변수에서 API 키 가져오기
NALIB_API_KEY = os.getenv("NALIB_DECODEING_API_KEY")  # 디코딩된 API 키 사용
NALIB_BASE_URL = "http://apis.data.go.kr/9720000/searchservice/basic"


def parse_nalib_xml_response(xml_content: str, current_page: int = 1, page_size: int = 10) -> NalibSearchResponse:
    """국회도서관 API XML 응답을 파싱하여 NalibSearchResponse로 변환"""
    try:
        root = ET.fromstring(xml_content)
        
        # 오류 응답 체크 (실제 API 응답 구조에 맞게 수정)
        result_msg = root.find(".//resultMsg")
        result_code = root.find(".//resultCode")
        
        if result_msg is not None and result_msg.text != "NORMAL_CODE":
            error_detail = f"API 오류: {result_msg.text}"
            if result_code is not None:
                error_detail += f" (코드: {result_code.text})"
            
            return NalibSearchResponse(
                total_count=0,
                current_page=1,
                page_size=10,
                total_pages=0,
                items=[],
                search_time=datetime.now(),
                search_query="",
                error_message=error_detail
            )
        
        # 정상 응답 파싱 - 실제 API 응답 구조에 맞게 조정
        items = []
        
        # 전체 결과 수 파싱 (total 태그 사용)
        total_elem = root.find(".//total")
        total_count = int(total_elem.text) if total_elem is not None and total_elem.text else 0
        
        print(f"Total count from XML: {total_count}")
        
        # recode 내의 item들을 파싱
        recode = root.find(".//recode")
        if recode is not None:
            print(f"Found recode element with {len(recode.findall('item'))} items")
            
            # 각 item은 name-value 쌍으로 구성되어 있고, 하나의 레코드가 여러 item으로 분산됨
            current_record = {}
            
            for item in recode.findall("item"):
                name_elem = item.find("name")
                value_elem = item.find("value")
                
                if name_elem is not None and value_elem is not None:
                    field_name = name_elem.text
                    field_value = value_elem.text
                    
                    # 제어번호가 나오면 새로운 레코드 시작
                    if field_name == "제어번호":
                        # 이전 레코드가 있으면 저장
                        if current_record:
                            nalib_item = NalibSearchItem(
                                title=current_record.get("기사명") or current_record.get("자료명"),
                                author=current_record.get("저자명"),
                                publisher=current_record.get("발행자") or current_record.get("출판사"),
                                pub_year=current_record.get("발행년도") or current_record.get("발행년"),
                                isbn=current_record.get("ISBN") or current_record.get("isbn"),
                                call_no=current_record.get("청구기호") or current_record.get("분류기호"),
                                material_type=current_record.get("자료유형") or current_record.get("매체구분"),
                                location=current_record.get("자료실") or current_record.get("소장처"),
                                url=current_record.get("URL") or current_record.get("url"),
                                abstract=current_record.get("목차") or current_record.get("초록")
                            )
                            items.append(nalib_item)
                        
                        # 새 레코드 시작
                        current_record = {field_name: field_value}
                    else:
                        # 현재 레코드에 필드 추가
                        current_record[field_name] = field_value
            
            # 마지막 레코드 처리
            if current_record:
                nalib_item = NalibSearchItem(
                    title=current_record.get("기사명") or current_record.get("자료명"),
                    author=current_record.get("저자명"),
                    publisher=current_record.get("발행자") or current_record.get("출판사"),
                    pub_year=current_record.get("발행년도") or current_record.get("발행년"),
                    isbn=current_record.get("ISBN") or current_record.get("isbn"),
                    call_no=current_record.get("청구기호") or current_record.get("분류기호"),
                    material_type=current_record.get("자료유형") or current_record.get("매체구분"),
                    location=current_record.get("자료실") or current_record.get("소장처"),
                    url=current_record.get("URL") or current_record.get("url"),
                    abstract=current_record.get("목차") or current_record.get("초록")
                )
                items.append(nalib_item)
        
        # 페이지 정보는 파라미터에서 전달받음
        # 전체 페이지 수 계산
        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 1
        
        return NalibSearchResponse(
            total_count=total_count,
            current_page=current_page,
            page_size=page_size,
            total_pages=total_pages,
            items=items,
            search_time=datetime.now()
        )
        
    except ET.ParseError as e:
        print(f"XML Parse Error: {e}")
        raise HTTPException(status_code=500, detail=f"XML parsing error: {str(e)}")
    except Exception as e:
        print(f"General Parse Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Response parsing error: {str(e)}")


def get_xml_text(element: ET.Element, tag: str) -> Optional[str]:
    """XML 요소에서 특정 태그의 텍스트 값을 안전하게 추출"""
    child = element.find(tag)
    return child.text if child is not None and child.text else None


@router.get("/search", response_model=NalibSearchResponse)
async def search_nalib(
    query: str = Query(..., description="검색 키워드"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지당 결과 수")
):
    """국회도서관 자료 검색"""
    if not NALIB_API_KEY:
        raise HTTPException(status_code=500, detail="국회도서관 API 키가 설정되지 않았습니다.")
    
    try:
        # 국회도서관 API는 displaylines 파라미터로 여러 레코드를 반환할 수 있음
        # 각 recode 요소가 하나의 완전한 레코드를 나타냄
        
        # 검색어 구성
        search_param = f"전체,{query}"
        
        # API 파라미터 설정
        params = {
            "serviceKey": NALIB_API_KEY,
            "pageno": page,
            "displaylines": page_size,  # 요청된 페이지 크기만큼 레코드 요청
            "search": search_param
        }
        
        print(f"API 요청 - 페이지 {page}, 크기 {page_size}: {params}")
        
        # API 호출
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(NALIB_BASE_URL, params=params)
            response.raise_for_status()
            
            print(f"HTTP 응답 상태: {response.status_code}")
            
            # XML 파싱
            root = ET.fromstring(response.text)
            
            # 전체 결과 수 추출
            total_count_elem = root.find(".//total")
            total_count = int(total_count_elem.text) if total_count_elem is not None else 0
            
            print(f"전체 결과 수: {total_count}")
            
            # 각 recode 요소를 하나의 레코드로 처리
            recodes = root.findall(".//recode")
            print(f"recode 요소 수: {len(recodes)}")
            
            all_items = []
            for recode in recodes:
                items_in_recode = recode.findall("item")
                print(f"recode 내 {len(items_in_recode)}개의 item 발견")
                
                # 각 recode는 하나의 완전한 레코드
                current_record = {}
                
                for item in items_in_recode:
                    name_elem = item.find("name")
                    value_elem = item.find("value")
                    
                    if name_elem is not None and value_elem is not None:
                        field_name = name_elem.text
                        field_value = value_elem.text
                        current_record[field_name] = field_value
                
                # 레코드를 NalibSearchItem으로 변환
                if current_record:
                    nalib_item = NalibSearchItem(
                        title=current_record.get("기사명") or current_record.get("자료명"),
                        author=current_record.get("저자명"),
                        publisher=current_record.get("발행자") or current_record.get("출판사"),
                        pub_year=current_record.get("발행년도") or current_record.get("발행년"),
                        isbn=current_record.get("ISBN") or current_record.get("isbn"),
                        call_no=current_record.get("청구기호") or current_record.get("분류기호"),
                        material_type=current_record.get("자료유형") or current_record.get("매체구분"),
                        location=current_record.get("자료실") or current_record.get("소장처"),
                        url=current_record.get("URL") or current_record.get("url"),
                        abstract=current_record.get("목차") or current_record.get("초록")
                    )
                    all_items.append(nalib_item)
        
        # 페이지 정보 계산
        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 1
        
        print(f"서버 응답: total_count={total_count}, items={len(all_items)}")
        
        return NalibSearchResponse(
            total_count=total_count,
            current_page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=all_items,
            search_time=datetime.now(),
            search_query=query
        )
        
    except httpx.HTTPStatusError as e:
        print(f"HTTP Status Error: {e}")
        raise HTTPException(status_code=e.response.status_code, detail=f"국회도서관 API 요청 실패: {str(e)}")
    except httpx.RequestError as e:
        print(f"Request Error: {e}")
        raise HTTPException(status_code=500, detail=f"국회도서관 API 연결 실패: {str(e)}")
    except HTTPException:
        # HTTPException은 그대로 재발생
        raise
    except Exception as e:
        print(f"General Exception: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"검색 처리 중 오류 발생: {str(e)}")


@router.get("/health")
async def health_check():
    """국회도서관 API 서비스 상태 확인"""
    if not NALIB_API_KEY:
        return {"status": "error", "message": "API 키가 설정되지 않았습니다."}
    
    try:
        # 간단한 테스트 검색으로 API 상태 확인
        params = {
            "serviceKey": NALIB_API_KEY,
            "pageno": 1,
            "displaylines": 1,
            "search": "전체,테스트"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(NALIB_BASE_URL, params=params)
            
            if response.status_code == 200:
                # XML 응답에서 결과 메시지 확인
                try:
                    root = ET.fromstring(response.text)
                    result_msg = root.find(".//resultMsg")
                    result_code = root.find(".//resultCode")
                    
                    if result_msg is not None and result_msg.text == "NORMAL_CODE" and result_code is not None and result_code.text == "00":
                        return {"status": "healthy", "message": "국회도서관 API 정상 작동"}
                    else:
                        return {
                            "status": "error", 
                            "message": f"API 오류: {result_msg.text if result_msg is not None else 'Unknown'} (코드: {result_code.text if result_code is not None else 'Unknown'})",
                            "response_preview": response.text[:200]
                        }
                except ET.ParseError as e:
                    return {
                        "status": "error", 
                        "message": f"XML 응답 파싱 실패: {str(e)}", 
                        "response_preview": response.text[:200]
                    }
            else:
                return {"status": "error", "message": f"HTTP {response.status_code}"}
                
    except Exception as e:
        return {"status": "error", "message": f"상태 확인 실패: {str(e)}"}