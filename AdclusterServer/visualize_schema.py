import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import json

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


def get_tables():
    """데이터베이스의 모든 테이블 목록 조회"""
    conn = connect_to_db()
    if not conn:
        return []
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
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
            tables = [table['table_name'] for table in cursor.fetchall()]
            return tables
    except Exception as e:
        print(f"테이블 목록 조회 오류: {e}")
        return []
    finally:
        conn.close()


def get_table_columns(table_name):
    """테이블의 컬럼 정보 조회"""
    conn = connect_to_db()
    if not conn:
        return []
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
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
            return cursor.fetchall()
    except Exception as e:
        print(f"컬럼 정보 조회 오류: {e}")
        return []
    finally:
        conn.close()


def get_foreign_keys():
    """모든 외래 키 관계 조회"""
    conn = connect_to_db()
    if not conn:
        return []
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            query = """
            SELECT
                tc.table_name AS table_name,
                kcu.column_name AS column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM
                information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
            WHERE
                tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
            """
            cursor.execute(query)
            return cursor.fetchall()
    except Exception as e:
        print(f"외래 키 관계 조회 오류: {e}")
        return []
    finally:
        conn.close()


def generate_schema_visualization():
    """데이터베이스 스키마 시각화 정보 생성"""
    tables = get_tables()
    foreign_keys = get_foreign_keys()
    
    schema = {
        "tables": [],
        "relationships": []
    }
    
    # 테이블 및 컬럼 정보 추가
    for table_name in tables:
        columns = get_table_columns(table_name)
        table_info = {
            "name": table_name,
            "columns": []
        }
        
        for col in columns:
            data_type = col['data_type']
            if col['character_maximum_length']:
                data_type += f"({col['character_maximum_length']})"
                
            column_info = {
                "name": col['column_name'],
                "type": data_type,
                "nullable": col['is_nullable'] == "YES"
            }
            table_info["columns"].append(column_info)
        
        schema["tables"].append(table_info)
    
    # 관계 정보 추가
    for fk in foreign_keys:
        relationship = {
            "source_table": fk['table_name'],
            "source_column": fk['column_name'],
            "target_table": fk['foreign_table_name'],
            "target_column": fk['foreign_column_name']
        }
        schema["relationships"].append(relationship)
    
    return schema


def save_schema_to_file(schema, filename="db_schema.json"):
    """스키마 정보를 파일로 저장"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(schema, f, indent=2, ensure_ascii=False)
        print(f"스키마 정보가 '{filename}' 파일에 저장되었습니다.")
    except Exception as e:
        print(f"파일 저장 오류: {e}")


def print_schema_summary(schema):
    """스키마 요약 정보 출력"""
    print("\n=== 데이터베이스 스키마 요약 ===")
    print(f"총 테이블 수: {len(schema['tables'])}")
    print(f"총 관계 수: {len(schema['relationships'])}")
    
    print("\n테이블 목록:")
    for i, table in enumerate(schema['tables'], 1):
        print(f"{i}. {table['name']} ({len(table['columns'])} 컬럼)")
    
    print("\n테이블 간 관계:")
    for i, rel in enumerate(schema['relationships'], 1):
        print(f"{i}. {rel['source_table']}.{rel['source_column']} -> {rel['target_table']}.{rel['target_column']}")


def main():
    print("데이터베이스 스키마 시각화 도구")
    schema = generate_schema_visualization()
    
    if schema['tables']:
        print_schema_summary(schema)
        save = input("\n스키마 정보를 파일로 저장하시겠습니까? (y/n): ")
        if save.lower() == 'y':
            filename = input("저장할 파일명 (기본: db_schema.json): ") or "db_schema.json"
            save_schema_to_file(schema, filename)
    else:
        print("스키마 정보를 가져올 수 없습니다.")


if __name__ == "__main__":
    main()