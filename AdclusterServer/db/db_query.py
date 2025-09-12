import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import argparse

# .env 파일에서 환경 변수 로드
load_dotenv()

# 데이터베이스 설정
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "nicchals")
DB_PASSWORD = os.getenv("DB_PASSWORD", "a770405z")
DB_NAME = os.getenv("DB_NAME", "adcluster_db")


def connect_to_db():
    """데이터베이스에 연결"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME
        )
        print(f"데이터베이스 '{DB_NAME}'에 성공적으로 연결되었습니다.")
        return conn
    except Exception as e:
        print(f"데이터베이스 연결 오류: {e}")
        return None


def execute_query(query, params=None, fetch=True):
    """SQL 쿼리 실행"""
    conn = connect_to_db()
    if not conn:
        return None
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            
            if fetch:
                results = cursor.fetchall()
                print(f"{len(results)}개의 결과가 반환되었습니다.")
                return results
            else:
                conn.commit()
                print(f"{cursor.rowcount}개의 행이 영향을 받았습니다.")
                return cursor.rowcount
    except Exception as e:
        print(f"쿼리 실행 오류: {e}")
        return None
    finally:
        conn.close()


def print_results(results):
    """쿼리 결과 출력"""
    if not results or len(results) == 0:
        print("결과가 없습니다.")
        return
    
    # 첫 번째 결과의 키를 컬럼으로 사용
    columns = list(results[0].keys())
    
    # 컬럼 너비 계산
    col_width = {}
    for col in columns:
        col_width[col] = max(len(col), max([len(str(row[col])) for row in results]))
    
    # 헤더 출력
    header = " | ".join([col.ljust(col_width[col]) for col in columns])
    separator = "-" * len(header)
    print(separator)
    print(header)
    print(separator)
    
    # 결과 출력
    for row in results:
        row_str = " | ".join([str(row[col]).ljust(col_width[col]) for col in columns])
        print(row_str)
    print(separator)


def interactive_mode():
    """대화형 모드로 쿼리 실행"""
    print("\n=== 대화형 SQL 쿼리 실행기 ===")
    print("쿼리를 입력하세요. 종료하려면 'exit' 또는 'quit'를 입력하세요.")
    
    while True:
        query = input("\nSQL> ")
        if query.lower() in ["exit", "quit"]:
            print("프로그램을 종료합니다.")
            break
        
        if query.strip():
            # SELECT 쿼리인지 확인
            is_select = query.strip().lower().startswith("select")
            results = execute_query(query, fetch=is_select)
            
            if results and is_select:
                print_results(results)


def main():
    parser = argparse.ArgumentParser(description="PostgreSQL 데이터베이스 쿼리 실행기")
    parser.add_argument("-q", "--query", help="실행할 SQL 쿼리")
    parser.add_argument("-i", "--interactive", action="store_true", help="대화형 모드 실행")
    
    args = parser.parse_args()
    
    if args.interactive:
        interactive_mode()
    elif args.query:
        is_select = args.query.strip().lower().startswith("select")
        results = execute_query(args.query, fetch=is_select)
        
        if results and is_select:
            print_results(results)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()