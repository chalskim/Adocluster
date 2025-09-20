#!/usr/bin/env python3
"""
Script to create a full backup of the PostgreSQL database
"""

import os
import sys
import subprocess
import datetime
import logging
from dotenv import load_dotenv

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

# 환경 변수 로드
load_dotenv()

def create_backup_directory():
    """백업 디렉토리 생성"""
    backup_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dbBackup')
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        logging.info(f"백업 디렉토리 생성: {backup_dir}")
    return backup_dir

def get_backup_filename(custom_filename=None):
    """백업 파일 이름 생성"""
    if custom_filename:
        return custom_filename
    
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    return f"full_backup_{today}"

def create_full_backup(backup_path):
    """PostgreSQL 데이터베이스 백업 생성 - SQLAlchemy 사용 (스키마 및 데이터 백업)"""
    try:
        import sqlalchemy
        from sqlalchemy import create_engine, text
        from sqlalchemy.orm import sessionmaker
        import sys
        import os
        
        # 현재 디렉토리를 시스템 경로에 추가
        current_dir = os.path.dirname(os.path.abspath(__file__))
        if current_dir not in sys.path:
            sys.path.append(current_dir)
        
        # 데이터베이스 연결 정보 가져오기
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME', 'adcluster_db')
        db_user = os.getenv('DB_USER', 'adcluster')
        db_password = os.getenv('DB_PASSWORD', 'a770405z')
        
        # SQLAlchemy 엔진 생성
        db_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        engine = create_engine(db_url)
        
        # SQL 파일 생성
        sql_file_path = backup_path + '.sql'
        with open(sql_file_path, 'w') as f:
            # 헤더 정보 추가
            f.write(f"-- Database backup for {db_name}\n")
            f.write(f"-- Generated on {datetime.datetime.now()}\n\n")
            
            # 1. 확장 모듈 백업
            logging.info("확장 모듈 백업 중")
            with engine.connect() as conn:
                extensions_query = text("""
                    SELECT extname FROM pg_extension 
                    WHERE extname != 'plpgsql';
                """)
                extensions = [row[0] for row in conn.execute(extensions_query)]
                
                for ext in extensions:
                    f.write(f"-- Extension: {ext}\n")
                    f.write(f"CREATE EXTENSION IF NOT EXISTS {ext};\n\n")
            
            # 2. ENUM 타입 백업
            logging.info("ENUM 타입 백업 중")
            with engine.connect() as conn:
                enum_query = text("""
                    SELECT t.typname AS enum_name,
                           e.enumlabel AS enum_value
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = 'public'
                    ORDER BY enum_name, e.enumsortorder;
                """)
                
                enum_values = {}
                for row in conn.execute(enum_query):
                    enum_name, enum_value = row
                    if enum_name not in enum_values:
                        enum_values[enum_name] = []
                    enum_values[enum_name].append(enum_value)
                
                for enum_name, values in enum_values.items():
                    f.write(f"-- ENUM Type: {enum_name}\n")
                    f.write(f"DROP TYPE IF EXISTS {enum_name} CASCADE;\n")
                    values_str = "', '".join(values)
                    f.write(f"CREATE TYPE {enum_name} AS ENUM ('{values_str}');\n\n")
            
            # 3. 뷰(View) 백업
            logging.info("뷰(View) 백업 중")
            with engine.connect() as conn:
                # 일반 뷰 백업
                views_query = text("""
                    SELECT schemaname, viewname, definition 
                    FROM pg_views 
                    WHERE schemaname = 'public'
                    ORDER BY viewname;
                """)
                
                views = conn.execute(views_query).fetchall()
                if views:
                    f.write("-- Views\n")
                    for row in views:
                        schema_name, view_name, definition = row
                        f.write(f"-- View: {view_name}\n")
                        f.write(f"DROP VIEW IF EXISTS {view_name} CASCADE;\n")
                        f.write(f"CREATE VIEW {view_name} AS {definition};\n\n")
                
                # 머티리얼라이즈드 뷰 백업
                materialized_views_query = text("""
                    SELECT schemaname, matviewname, definition 
                    FROM pg_matviews 
                    WHERE schemaname = 'public'
                    ORDER BY matviewname;
                """)
                
                mat_views = conn.execute(materialized_views_query).fetchall()
                if mat_views:
                    f.write("-- Materialized Views\n")
                    for row in mat_views:
                        schema_name, mat_view_name, definition = row
                        f.write(f"-- Materialized View: {mat_view_name}\n")
                        f.write(f"DROP MATERIALIZED VIEW IF EXISTS {mat_view_name} CASCADE;\n")
                        f.write(f"CREATE MATERIALIZED VIEW {mat_view_name} AS {definition};\n\n")
            
            # 4. 테이블 스키마 및 데이터 백업
            # 테이블 목록 가져오기
            with engine.connect() as conn:
                tables_query = text("""
                    SELECT tablename FROM pg_tables 
                    WHERE schemaname = 'public'
                    ORDER BY tablename;
                """)
                tables = [row[0] for row in conn.execute(tables_query)]
            
            # 테이블 간 의존성 정보 가져오기 (외래 키 제약조건)
            with engine.connect() as conn:
                fk_query = text("""
                    SELECT
                        tc.table_name,
                        kcu.column_name,
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
                    WHERE tc.constraint_type = 'FOREIGN KEY';
                """)
                foreign_keys = []
                for row in conn.execute(fk_query):
                    foreign_keys.append({
                        'table': row[0],
                        'column': row[1],
                        'ref_table': row[2],
                        'ref_column': row[3]
                    })
            
            # 각 테이블 스키마 및 데이터 덤프
            for table in tables:
                logging.info(f"테이블 백업 중: {table}")
                
                # 테이블 스키마 정보 가져오기
                with engine.connect() as conn:
                    # 컬럼 정보
                    schema_query = text(f"""
                        SELECT 
                            column_name, 
                            data_type,
                            character_maximum_length,
                            is_nullable,
                            column_default
                        FROM information_schema.columns 
                        WHERE table_name = '{table}' 
                        ORDER BY ordinal_position;
                    """)
                    columns = []
                    for row in conn.execute(schema_query):
                        columns.append({
                            'name': row[0],
                            'type': row[1],
                            'length': row[2],
                            'nullable': row[3],
                            'default': row[4]
                        })
                    
                    # 기본 키 정보
                    pk_query = text(f"""
                        SELECT a.attname
                        FROM pg_index i
                        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                        WHERE i.indrelid = '{table}'::regclass AND i.indisprimary;
                    """)
                    primary_keys = [row[0] for row in conn.execute(pk_query)]
                    
                    # 인덱스 정보
                    index_query = text(f"""
                        SELECT
                            i.relname AS index_name,
                            a.attname AS column_name,
                            ix.indisunique AS is_unique
                        FROM
                            pg_class t,
                            pg_class i,
                            pg_index ix,
                            pg_attribute a
                        WHERE
                            t.oid = ix.indrelid
                            AND i.oid = ix.indexrelid
                            AND a.attrelid = t.oid
                            AND a.attnum = ANY(ix.indkey)
                            AND t.relkind = 'r'
                            AND t.relname = '{table}'
                        ORDER BY
                            i.relname, a.attnum;
                    """)
                    indexes = {}
                    for row in conn.execute(index_query):
                        index_name, column_name, is_unique = row
                        if index_name not in indexes:
                            indexes[index_name] = {'columns': [], 'unique': is_unique}
                        indexes[index_name]['columns'].append(column_name)
                
                # 테이블 생성 구문 추가
                f.write(f"\n-- Table: {table}\n")
                f.write(f"DROP TABLE IF EXISTS {table} CASCADE;\n")
                f.write(f"CREATE TABLE {table} (\n")
                
                # 컬럼 정의
                column_defs = []
                for col in columns:
                    col_def = f"    {col['name']} {col['type']}"
                    
                    # 문자열 길이 추가
                    if col['length'] is not None and 'char' in col['type'].lower():
                        col_def += f"({col['length']})"
                    
                    # NULL 여부
                    if col['nullable'] == 'NO':
                        col_def += " NOT NULL"
                    
                    # 기본값
                    if col['default'] is not None:
                        col_def += f" DEFAULT {col['default']}"
                    
                    column_defs.append(col_def)
                
                # 기본 키 추가
                if primary_keys:
                    column_defs.append(f"    PRIMARY KEY ({', '.join(primary_keys)})")
                
                f.write(',\n'.join(column_defs))
                f.write("\n);\n")
                
                # 인덱스 생성 구문
                for index_name, index_info in indexes.items():
                    # 기본 키 인덱스는 건너뛰기 (이미 테이블 생성 시 추가됨)
                    if all(col in primary_keys for col in index_info['columns']):
                        continue
                    
                    unique_str = "UNIQUE " if index_info['unique'] else ""
                    f.write(f"CREATE {unique_str}INDEX {index_name} ON {table} ({', '.join(index_info['columns'])});\n")
                
                # 테이블 데이터 가져오기
                with engine.connect() as conn:
                    data_query = text(f"SELECT * FROM {table};")
                    rows = list(conn.execute(data_query))
                    
                    if rows:
                        # INSERT 구문 생성
                        column_names = [col['name'] for col in columns]
                        f.write(f"\n-- Data for table: {table}\n")
                        
                        for row in rows:
                            values = []
                            for i, val in enumerate(row):
                                if val is None:
                                    values.append('NULL')
                                elif isinstance(val, (int, float)):
                                    values.append(str(val))
                                elif isinstance(val, (datetime.date, datetime.datetime)):
                                    values.append(f"'{val}'")
                                else:
                                    # 문자열 이스케이프 처리
                                    escaped_val = str(val).replace("'", "''")
                                    values.append(f"'{escaped_val}'")
                            
                            f.write(f"INSERT INTO {table} ({', '.join(column_names)}) VALUES ({', '.join(values)});\n")
            
            # 4. 외래 키 제약조건 추가
            f.write("\n-- Foreign Key Constraints\n")
            for fk in foreign_keys:
                constraint_name = f"fk_{fk['table']}_{fk['column']}_{fk['ref_table']}"
                f.write(f"ALTER TABLE {fk['table']} ADD CONSTRAINT {constraint_name} ")
                f.write(f"FOREIGN KEY ({fk['column']}) REFERENCES {fk['ref_table']}({fk['ref_column']});\n")
        
        logging.info(f"백업 완료: {sql_file_path}")
        
        # 백업 파일 크기 확인
        file_size = os.path.getsize(sql_file_path) / (1024 * 1024)  # MB 단위로 변환
        logging.info(f"백업 파일 크기: {file_size:.2f} MB")
        
        return True
        
        logging.info(f"백업 시작: {backup_path}")
        process = subprocess.run(cmd, env=env, check=True, capture_output=True, text=True)
        
        # 백업 파일 크기 확인
        file_size = os.path.getsize(backup_path) / (1024 * 1024)  # MB 단위로 변환
        logging.info(f"백업 완료: {backup_path} (크기: {file_size:.2f} MB)")
        
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"백업 실패: {e.stderr}")
        return False
    except Exception as e:
        logging.error(f"오류 발생: {str(e)}")
        return False

def main():
    """메인 함수"""
    # 커맨드 라인 인자 처리
    custom_filename = None
    if len(sys.argv) > 1:
        custom_filename = sys.argv[1]
    
    # 백업 디렉토리 생성
    backup_dir = create_backup_directory()
    
    # 백업 파일 이름 생성
    backup_filename = get_backup_filename(custom_filename)
    backup_path = os.path.join(backup_dir, backup_filename)
    
    # 백업 실행
    success = create_full_backup(backup_path)
    
    if success:
        logging.info("데이터베이스 백업이 성공적으로 완료되었습니다.")
        sys.exit(0)
    else:
        logging.error("데이터베이스 백업 중 오류가 발생했습니다.")
        sys.exit(1)

if __name__ == "__main__":
    main()