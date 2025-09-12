import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

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


def list_tables():
    """데이터베이스의 모든 테이블 목록 조회"""
    conn = connect_to_db()
    if not conn:
        return
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # 테이블 목록 조회 쿼리
            query = """
            SELECT 
                table_name 
            FROM 
                information_schema.tables 
            WHERE 
                table_schema = 'public' 
            ORDER BY 
                table_name
            """
            cursor.execute(query)
            tables = cursor.fetchall()
            
            if not tables:
                print("데이터베이스에 테이블이 없습니다.")
                return
            
            print("\n=== 데이터베이스 테이블 목록 ===")
            for i, table in enumerate(tables, 1):
                print(f"{i}. {table['table_name']}")
            
            # 테이블 선택 및 구조 확인
            while True:
                choice = input("\n테이블 구조를 확인하려면 번호를 입력하세요 (종료: q): ")
                if choice.lower() == 'q':
                    break
                
                try:
                    index = int(choice) - 1
                    if 0 <= index < len(tables):
                        show_table_structure(conn, tables[index]['table_name'])
                    else:
                        print("유효하지 않은 번호입니다.")
                except ValueError:
                    print("유효한 번호를 입력하세요.")
    
    except Exception as e:
        print(f"테이블 목록 조회 오류: {e}")
    finally:
        conn.close()


def show_table_structure(conn, table_name):
    """테이블 구조 조회"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # 테이블 컬럼 정보 조회
            query = """
            SELECT 
                column_name, 
                data_type, 
                character_maximum_length, 
                column_default, 
                is_nullable 
            FROM 
                information_schema.columns 
            WHERE 
                table_schema = 'public' AND 
                table_name = %s 
            ORDER BY 
                ordinal_position
            """
            cursor.execute(query, (table_name,))
            columns = cursor.fetchall()
            
            if not columns:
                print(f"테이블 '{table_name}'에 컬럼이 없습니다.")
                return
            
            print(f"\n=== 테이블 '{table_name}' 구조 ===")
            print("{:<20} {:<15} {:<10} {:<20} {:<10}".format(
                "컬럼명", "데이터 타입", "길이", "기본값", "NULL 허용"
            ))
            print("-" * 80)
            
            for col in columns:
                length = str(col['character_maximum_length']) if col['character_maximum_length'] else "-"
                default = str(col['column_default']) if col['column_default'] else "-"
                nullable = "YES" if col['is_nullable'] == "YES" else "NO"
                
                print("{:<20} {:<15} {:<10} {:<20} {:<10}".format(
                    col['column_name'], 
                    col['data_type'], 
                    length, 
                    default[:20], 
                    nullable
                ))
            
            # 테이블의 행 수 조회
            count_query = f"SELECT COUNT(*) as count FROM {table_name}"
            cursor.execute(count_query)
            count = cursor.fetchone()['count']
            print(f"\n총 {count}개의 행이 있습니다.")
            
            # 샘플 데이터 조회 여부 확인
            if count > 0:
                view_sample = input("샘플 데이터를 확인하시겠습니까? (y/n): ")
                if view_sample.lower() == 'y':
                    sample_query = f"SELECT * FROM {table_name} LIMIT 5"
                    cursor.execute(sample_query)
                    samples = cursor.fetchall()
                    
                    print(f"\n=== '{table_name}' 샘플 데이터 (최대 5개) ===")
                    for i, row in enumerate(samples, 1):
                        print(f"\n[행 {i}]")
                        for key, value in row.items():
                            print(f"{key}: {value}")
    
    except Exception as e:
        print(f"테이블 구조 조회 오류: {e}")


if __name__ == "__main__":
    list_tables()