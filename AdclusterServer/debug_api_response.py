#!/usr/bin/env python3
"""
국회도서관 API 실제 응답 구조 확인
"""

import httpx
import xml.etree.ElementTree as ET

# API 설정
API_URL = "http://apis.data.go.kr/9720000/searchservice/basic"
API_KEY = "R2aIYnRB8Ow2zvz6e0fTyhgAU8wF5NU9BYOAPZ/JegYru2RXQ5buuN8Xx5PoOa6w+AjWXLXn5JyeR9pwiGh3yA=="

def debug_api_response():
    """실제 API 응답 구조 분석"""
    print("=== 국회도서관 API 응답 구조 분석 ===")
    
    # API 요청 파라미터
    params = {
        'serviceKey': API_KEY,
        'pageno': 1,
        'displaylines': 3,  # 적은 수로 테스트
        'search': '전체,코로나'
    }
    
    try:
        # API 호출
        response = httpx.get(API_URL, params=params, timeout=30.0)
        print(f"응답 상태: {response.status_code}")
        
        if response.status_code == 200:
            xml_text = response.text
            print(f"응답 길이: {len(xml_text)} 문자")
            print("\n=== XML 응답 (처음 1000자) ===")
            print(xml_text[:1000])
            print("...")
            
            # XML 파싱
            root = ET.fromstring(xml_text)
            
            print("\n=== XML 구조 분석 ===")
            print(f"루트 태그: {root.tag}")
            
            # 전체 결과 수
            total_elem = root.find('total')
            if total_elem is not None:
                print(f"전체 결과 수: {total_elem.text}")
            
            # recode 요소 찾기
            recode_elem = root.find('recode')
            if recode_elem is not None:
                items = recode_elem.findall('item')
                print(f"recode 내 item 수: {len(items)}")
                
                # 각 item 분석
                current_record = {}
                record_count = 0
                
                for i, item in enumerate(items):
                    name_elem = item.find('name')
                    value_elem = item.find('value')
                    
                    if name_elem is not None and value_elem is not None:
                        field_name = name_elem.text
                        field_value = value_elem.text
                        
                        print(f"Item {i+1}: {field_name} = {field_value}")
                        
                        if field_name == "제어번호":
                            if current_record:
                                record_count += 1
                                print(f"  --> 레코드 {record_count} 완료")
                            current_record = {field_name: field_value}
                        else:
                            current_record[field_name] = field_value
                
                # 마지막 레코드
                if current_record:
                    record_count += 1
                    print(f"  --> 레코드 {record_count} 완료 (마지막)")
                
                print(f"\n총 파싱된 레코드 수: {record_count}")
            else:
                print("recode 요소를 찾을 수 없습니다.")
        else:
            print(f"API 호출 실패: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"오류 발생: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_api_response()