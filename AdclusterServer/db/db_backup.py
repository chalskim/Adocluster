import os
import subprocess
import datetime
import argparse
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

# 데이터베이스 설정
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "nicchals")
DB_PASSWORD = os.getenv("DB_PASSWORD", "a770405z")
DB_NAME = os.getenv("DB_NAME", "adcluster_db")

# 백업 디렉토리 설정
BACKUP_DIR = "./backups"


def ensure_backup_dir():
    """백업 디렉토리가 존재하는지 확인하고 없으면 생성"""
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        print(f"백업 디렉토리 '{BACKUP_DIR}'를 생성했습니다.")


def backup_database(filename=None):
    """데이터베이스 백업"""
    ensure_backup_dir()
    
    # 백업 파일명 생성 (지정되지 않은 경우)
    if not filename:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{DB_NAME}_{timestamp}.sql"
    
    # 백업 파일 경로
    backup_path = os.path.join(BACKUP_DIR, filename)
    
    # pg_dump 명령 구성
    cmd = [
        "pg_dump",
        f"--host={DB_HOST}",
        f"--port={DB_PORT}",
        f"--username={DB_USER}",
        "--format=c",  # 압축된 형식
        f"--file={backup_path}",
        DB_NAME
    ]
    
    # 환경 변수에 비밀번호 설정 (보안을 위해)
    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASSWORD
    
    try:
        print(f"데이터베이스 '{DB_NAME}' 백업 중...")
        process = subprocess.run(cmd, env=env, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"백업이 성공적으로 완료되었습니다: {backup_path}")
        return backup_path
    except subprocess.CalledProcessError as e:
        print(f"백업 오류: {e}")
        print(f"오류 메시지: {e.stderr.decode() if e.stderr else '알 수 없음'}")
        return None


def restore_database(backup_file):
    """데이터베이스 복원"""
    # 백업 파일 경로 확인
    if not os.path.isabs(backup_file):
        backup_file = os.path.join(BACKUP_DIR, backup_file)
    
    if not os.path.exists(backup_file):
        print(f"백업 파일을 찾을 수 없습니다: {backup_file}")
        return False
    
    # pg_restore 명령 구성
    cmd = [
        "pg_restore",
        f"--host={DB_HOST}",
        f"--port={DB_PORT}",
        f"--username={DB_USER}",
        "--clean",  # 기존 객체 삭제 후 복원
        "--if-exists",  # 기존 객체가 있는 경우에만 삭제
        f"--dbname={DB_NAME}",
        backup_file
    ]
    
    # 환경 변수에 비밀번호 설정 (보안을 위해)
    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASSWORD
    
    try:
        print(f"데이터베이스 '{DB_NAME}'에 백업 파일 '{backup_file}' 복원 중...")
        process = subprocess.run(cmd, env=env, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("복원이 성공적으로 완료되었습니다.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"복원 오류: {e}")
        print(f"오류 메시지: {e.stderr.decode() if e.stderr else '알 수 없음'}")
        return False


def list_backups():
    """사용 가능한 백업 파일 목록 표시"""
    ensure_backup_dir()
    
    backup_files = [f for f in os.listdir(BACKUP_DIR) if f.endswith(".sql")]
    
    if not backup_files:
        print("사용 가능한 백업 파일이 없습니다.")
        return []
    
    print("\n=== 사용 가능한 백업 파일 ===")
    for i, file in enumerate(backup_files, 1):
        file_path = os.path.join(BACKUP_DIR, file)
        file_size = os.path.getsize(file_path) / (1024 * 1024)  # MB 단위로 변환
        file_date = datetime.datetime.fromtimestamp(os.path.getmtime(file_path))
        print(f"{i}. {file} ({file_size:.2f} MB, {file_date})")
    
    return backup_files


def interactive_mode():
    """대화형 모드로 백업 및 복원 작업 수행"""
    print("\n=== PostgreSQL 데이터베이스 백업 및 복원 도구 ===")
    
    while True:
        print("\n작업을 선택하세요:")
        print("1. 데이터베이스 백업")
        print("2. 데이터베이스 복원")
        print("3. 백업 파일 목록 보기")
        print("4. 종료")
        
        choice = input("\n선택 (1-4): ")
        
        if choice == "1":
            filename = input("백업 파일명 (기본값: 자동 생성): ")
            backup_database(filename if filename else None)
        
        elif choice == "2":
            backup_files = list_backups()
            if backup_files:
                selection = input("\n복원할 백업 파일 번호를 입력하세요 (취소: 0): ")
                try:
                    index = int(selection) - 1
                    if index == -1:
                        print("복원이 취소되었습니다.")
                    elif 0 <= index < len(backup_files):
                        confirm = input(f"'{backup_files[index]}'을(를) 복원하시겠습니까? 이 작업은 되돌릴 수 없습니다. (y/n): ")
                        if confirm.lower() == 'y':
                            restore_database(backup_files[index])
                    else:
                        print("유효하지 않은 번호입니다.")
                except ValueError:
                    print("유효한 번호를 입력하세요.")
        
        elif choice == "3":
            list_backups()
        
        elif choice == "4":
            print("프로그램을 종료합니다.")
            break
        
        else:
            print("유효하지 않은 선택입니다. 1-4 사이의 숫자를 입력하세요.")


def main():
    parser = argparse.ArgumentParser(description="PostgreSQL 데이터베이스 백업 및 복원 도구")
    parser.add_argument("-b", "--backup", action="store_true", help="데이터베이스 백업 수행")
    parser.add_argument("-r", "--restore", metavar="FILE", help="지정된 백업 파일로 데이터베이스 복원")
    parser.add_argument("-l", "--list", action="store_true", help="사용 가능한 백업 파일 목록 표시")
    parser.add_argument("-i", "--interactive", action="store_true", help="대화형 모드 실행")
    
    args = parser.parse_args()
    
    if args.backup:
        backup_database()
    elif args.restore:
        restore_database(args.restore)
    elif args.list:
        list_backups()
    elif args.interactive:
        interactive_mode()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()