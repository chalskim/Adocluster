import os
import psycopg2
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

# 데이터베이스 설정
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "adcluster")
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

def check_projects():
    """프로젝트 테이블 확인"""
    conn = connect_to_db()
    if not conn:
        return
    
    try:
        with conn.cursor() as cursor:
            # 프로젝트 테이블 행 수 확인
            cursor.execute("SELECT COUNT(*) FROM projects")
            count = cursor.fetchone()[0]
            print(f"\n총 프로젝트 수: {count}")
            
            # 최근 프로젝트 10개 조회
            cursor.execute("""
                SELECT prjid, title, crtid, created_at 
                FROM projects 
                ORDER BY created_at DESC 
                LIMIT 10
            """)
            projects = cursor.fetchall()
            
            print("\n=== 최근 프로젝트 (최대 10개) ===")
            if projects:
                for i, project in enumerate(projects, 1):
                    print(f"{i}. ID: {project[0]}, 제목: {project[1]}, 생성자: {project[2]}, 생성일: {project[3]}")
            else:
                print("프로젝트가 없습니다.")
                
            # users 테이블 확인
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            print(f"\n총 사용자 수: {user_count}")
            
            # 사용자 정보 조회
            cursor.execute("SELECT uid, uemail, uname FROM users ORDER BY ucreate_at DESC LIMIT 5")
            users = cursor.fetchall()
            
            print("\n=== 최근 사용자 (최대 5명) ===")
            if users:
                for i, user in enumerate(users, 1):
                    print(f"{i}. ID: {user[0]}, 이메일: {user[1]}, 이름: {user[2]}")
            else:
                print("사용자가 없습니다.")
                
    except Exception as e:
        print(f"프로젝트 조회 오류: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_projects()