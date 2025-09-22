#!/usr/bin/env python3
"""
국회도서관 API XML 파싱 로직 테스트
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routers.nalib import parse_nalib_xml_response

# 테스트용 XML 데이터 (국회도서관 API 응답 형식)
test_xml = """<?xml version="1.0" encoding="UTF-8"?>
<OpenAPI_ServiceResponse>
    <cmmMsgHeader>
        <errMsg></errMsg>
        <returnAuthMsg>NORMAL_CODE</returnAuthMsg>
        <returnReasonCode>00</returnReasonCode>
    </cmmMsgHeader>
    <msgBody>
        <total>274366</total>
        <recode>
            <item>
                <name>제어번호</name>
                <value>000001</value>
            </item>
            <item>
                <name>자료명</name>
                <value>코로나19와 사회변화</value>
            </item>
            <item>
                <name>저자명</name>
                <value>김철수</value>
            </item>
            <item>
                <name>발행자</name>
                <value>학술출판사</value>
            </item>
            <item>
                <name>발행년도</name>
                <value>2021</value>
            </item>
            <item>
                <name>ISBN</name>
                <value>978-89-1234-567-8</value>
            </item>
            <item>
                <name>청구기호</name>
                <value>616.9 김철수</value>
            </item>
            <item>
                <name>자료유형</name>
                <value>단행본</value>
            </item>
            <item>
                <name>자료실</name>
                <value>일반자료실</value>
            </item>
            <item>
                <name>제어번호</name>
                <value>000002</value>
            </item>
            <item>
                <name>자료명</name>
                <value>코로나19 경제 영향 분석</value>
            </item>
            <item>
                <name>저자명</name>
                <value>이영희</value>
            </item>
            <item>
                <name>발행자</name>
                <value>경제연구소</value>
            </item>
            <item>
                <name>발행년도</name>
                <value>2022</value>
            </item>
            <item>
                <name>ISBN</name>
                <value>978-89-5678-901-2</value>
            </item>
            <item>
                <name>청구기호</name>
                <value>330.9 이영희</value>
            </item>
            <item>
                <name>자료유형</name>
                <value>단행본</value>
            </item>
            <item>
                <name>자료실</name>
                <value>경제자료실</value>
            </item>
            <item>
                <name>제어번호</name>
                <value>000003</value>
            </item>
            <item>
                <name>자료명</name>
                <value>포스트 코로나 시대의 교육</value>
            </item>
            <item>
                <name>저자명</name>
                <value>박민수</value>
            </item>
            <item>
                <name>발행자</name>
                <value>교육출판사</value>
            </item>
            <item>
                <name>발행년도</name>
                <value>2023</value>
            </item>
            <item>
                <name>ISBN</name>
                <value>978-89-2345-678-9</value>
            </item>
            <item>
                <name>청구기호</name>
                <value>370 박민수</value>
            </item>
            <item>
                <name>자료유형</name>
                <value>단행본</value>
            </item>
            <item>
                <name>자료실</name>
                <value>교육자료실</value>
            </item>
        </recode>
    </msgBody>
</OpenAPI_ServiceResponse>"""

def test_parsing():
    """XML 파싱 테스트"""
    print("=== 국회도서관 API XML 파싱 테스트 ===")
    
    try:
        # 파싱 실행
        result = parse_nalib_xml_response(test_xml, current_page=1, page_size=10)
        
        print(f"총 결과 수: {result.total_count}")
        print(f"현재 페이지: {result.current_page}")
        print(f"페이지 크기: {result.page_size}")
        print(f"총 페이지 수: {result.total_pages}")
        print(f"파싱된 아이템 수: {len(result.items)}")
        print()
        
        # 각 아이템 출력
        for i, item in enumerate(result.items, 1):
            print(f"=== 아이템 {i} ===")
            print(f"제목: {item.title}")
            print(f"저자: {item.author}")
            print(f"출판사: {item.publisher}")
            print(f"발행년도: {item.pub_year}")
            print(f"ISBN: {item.isbn}")
            print(f"청구기호: {item.call_no}")
            print(f"자료유형: {item.material_type}")
            print(f"자료실: {item.location}")
            print()
        
        print("✅ 파싱 테스트 성공!")
        return True
        
    except Exception as e:
        print(f"❌ 파싱 테스트 실패: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_parsing()