#!/usr/bin/env python3
"""
국회도서관 API 여러 레코드 XML 파싱 테스트
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routers.nalib import parse_nalib_xml_response

# 여러 레코드가 포함된 테스트용 XML 데이터
test_xml_multiple = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<response>
    <header>
        <resultMsg>NORMAL_CODE</resultMsg>
        <resultCode>00</resultCode>
    </header>
    <total>274366</total>
    <recode>
        <item>
            <name>제어번호</name>
            <value>KINX2025035689</value>
        </item>
        <item>
            <name>기사명</name>
            <value>지역 농산물 이용한 요거트로 낙농 6차산업 선도</value>
        </item>
        <item>
            <name>저자명</name>
            <value>취재: 김은총</value>
        </item>
        <item>
            <name>수록지명</name>
            <value>(월간)낙농ㆍ육우. 제45권 제1호 통권513호 (2025년 1월)</value>
        </item>
        <item>
            <name>발행자</name>
            <value>한국낙농육우협회</value>
        </item>
        <item>
            <name>발행년도</name>
            <value>2025</value>
        </item>
        <item>
            <name>자료실</name>
            <value>[본관] 정기간행물실(524호)</value>
        </item>
        <item>
            <name>제어번호</name>
            <value>KINX2025035690</value>
        </item>
        <item>
            <name>기사명</name>
            <value>코로나19 이후 축산업 변화</value>
        </item>
        <item>
            <name>저자명</name>
            <value>이영희</value>
        </item>
        <item>
            <name>발행자</name>
            <value>축산연구소</value>
        </item>
        <item>
            <name>발행년도</name>
            <value>2024</value>
        </item>
        <item>
            <name>자료실</name>
            <value>[본관] 일반자료실</value>
        </item>
        <item>
            <name>제어번호</name>
            <value>KINX2025035691</value>
        </item>
        <item>
            <name>기사명</name>
            <value>포스트 코로나 시대 농업 정책</value>
        </item>
        <item>
            <name>저자명</name>
            <value>박민수</value>
        </item>
        <item>
            <name>발행자</name>
            <value>농업정책연구원</value>
        </item>
        <item>
            <name>발행년도</name>
            <value>2023</value>
        </item>
        <item>
            <name>자료실</name>
            <value>[본관] 정책자료실</value>
        </item>
    </recode>
</response>"""

def test_multiple_records():
    """여러 레코드 XML 파싱 테스트"""
    print("=== 여러 레코드 XML 파싱 테스트 ===")
    
    try:
        # 파싱 실행
        result = parse_nalib_xml_response(test_xml_multiple, current_page=1, page_size=10)
        
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
            print(f"자료실: {item.location}")
            print()
        
        expected_count = 3  # 3개의 레코드가 있어야 함
        if len(result.items) == expected_count:
            print(f"✅ 파싱 테스트 성공! {expected_count}개 레코드 모두 파싱됨")
            return True
        else:
            print(f"❌ 파싱 테스트 실패: 예상 {expected_count}개, 실제 {len(result.items)}개")
            return False
        
    except Exception as e:
        print(f"❌ 파싱 테스트 실패: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_multiple_records()