#!/usr/bin/env python3
"""
국회도서관 API 구조 분석 스크립트
다양한 파라미터 조합으로 API 응답 구조를 분석합니다.
"""

import httpx
import xml.etree.ElementTree as ET
import os
from urllib.parse import urlencode
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# API 설정
API_KEY = os.getenv("NALIB_DECODEING_API_KEY")  # 서버와 동일한 환경변수 사용
BASE_URL = "http://apis.data.go.kr/9720000/searchservice/basic"

print(f"API 키 확인: {API_KEY[:20]}..." if API_KEY else "API 키 없음")

async def test_api_parameters():
    """다양한 파라미터 조합으로 API 테스트"""
    
    test_cases = [
        {"pageno": 1, "displaylines": 10, "search": "전체,교육"},
        {"pageno": 1, "displaylines": 20, "search": "전체,교육"},
        {"pageno": 2, "displaylines": 10, "search": "전체,교육"},
        {"pageno": 1, "displaylines": 1, "search": "전체,교육"},
    ]
    
    async with httpx.AsyncClient() as client:
        for i, params in enumerate(test_cases, 1):
            print(f"\n=== 테스트 케이스 {i} ===")
            print(f"파라미터: {params}")
            
            # API 요청
            request_params = {
                "serviceKey": API_KEY,
                **params
            }
            
            try:
                response = await client.get(BASE_URL, params=request_params)
                print(f"HTTP 상태: {response.status_code}")
                print(f"응답 길이: {len(response.text)}")
                
                # 응답 내용 일부 출력
                print(f"응답 시작 부분: {response.text[:500]}...")
                
                if response.status_code == 200:
                    # XML 파싱
                    root = ET.fromstring(response.text)
                    
                    # 전체 결과 수
                    total_count_elem = root.find(".//total")
                    total_count = int(total_count_elem.text) if total_count_elem is not None else 0
                    print(f"전체 결과 수: {total_count}")
                    
                    # recode 요소들 찾기
                    recodes = root.findall(".//recode")
                    print(f"recode 요소 수: {len(recodes)}")
                    
                    for j, recode in enumerate(recodes):
                        items = recode.findall("item")
                        print(f"  recode {j+1}: {len(items)}개의 item")
                        
                        # 제어번호 찾기
                        control_numbers = []
                        for item in items:
                            name_elem = item.find("name")
                            value_elem = item.find("value")
                            if name_elem is not None and name_elem.text == "제어번호":
                                control_numbers.append(value_elem.text if value_elem is not None else "None")
                        
                        print(f"    제어번호: {control_numbers}")
                        
                        # 첫 번째와 마지막 item의 name 확인
                        if items:
                            first_name = items[0].find("name")
                            last_name = items[-1].find("name")
                            print(f"    첫 번째 item name: {first_name.text if first_name is not None else 'None'}")
                            print(f"    마지막 item name: {last_name.text if last_name is not None else 'None'}")
                
            except Exception as e:
                print(f"오류 발생: {e}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_api_parameters())