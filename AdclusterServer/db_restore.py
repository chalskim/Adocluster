#!/usr/bin/env python3
"""
Script to restore a PostgreSQL database from a backup file
"""

import os
import sys
import subprocess
import glob
import logging
import argparse
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

def get_backup_directory():
    """백업 디렉토리 경로 반환"""
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dbBackup')

def get_latest_backup_file():
    """가장 최근 백업 파일 찾기"""
    backup_dir = get_backup_directory()
    backup_files = glob.glob(os.path.join(backup_dir, 'full_backup_*.sql'))
    
    if not backup_files:
        return None
    
    # 수정 시간 기준으로 정렬
    backup_files.sort(key=os.path.getmtime, reverse=True)
    return backup_files[0]

def confirm_restore(backup_file, dry_run=False):
    """복원 작업 확인"""
    if dry_run:
        return True
    
    file_size = os.path.getsize(backup_file) / (1024 * 1024)  # MB 단위로 변환
    print(f"\n경고: 데이터베이스 복원은 기존 데이터를 덮어쓰게 됩니다!")
    print(f"복원할 백업 파일: {backup_file} (크기: {file_size:.2f} MB)")
    
    while True:
        response = input("계속 진행하시겠습니까? (y/n): ").lower()
        if response in ['y', 'yes']:
            return True
        elif response in ['n', 'no']:
            return False
        else:
            print("'y' 또는 'n'으로 응답해주세요.")

def restore_database(backup_file, dry_run=False):
    """데이터베이스 복원 - SQLAlchemy 사용"""
    try:
        # 환경 변수에서 데이터베이스 연결 정보 가져오기
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME', 'adcluster_db')
        db_user = os.getenv('DB_USER', 'adcluster')
        db_password = os.getenv('DB_PASSWORD', 'a770405z')
        
        # SQL 파일 내용 읽기
        with open(backup_file, 'r') as f:
            sql_content = f.read()
        
        if dry_run:
            logging.info(f"드라이 런 모드: SQL 파일 크기: {len(sql_content)} 바이트")
            return True
        
        # SQLAlchemy 사용하여 복원
        import sqlalchemy
        from sqlalchemy import create_engine, text
        
        # 데이터베이스 연결
        db_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        engine = create_engine(db_url)
        
        # SQL 명령 실행
        logging.info(f"복원 시작: {backup_file}")
        
        # SQL 파일을 명령으로 분리
        sql_commands = []
        current_command = ""
        
        for line in sql_content.splitlines():
            # 주석 및 빈 줄 건너뛰기
            if line.strip().startswith('--') or not line.strip():
                continue
                
            current_command += line + " "
            
            # 명령이 완료되면 리스트에 추가
            if line.strip().endswith(';'):
                sql_commands.append(current_command)
                current_command = ""
        
        # 트랜잭션 내에서 명령 실행
        with engine.begin() as conn:
            for i, cmd in enumerate(sql_commands):
                try:
                    conn.execute(text(cmd))
                    if (i + 1) % 100 == 0 or i + 1 == len(sql_commands):
                        logging.info(f"진행 중: {i + 1}/{len(sql_commands)} 명령 실행 완료")
                except Exception as e:
                    logging.error(f"명령 실행 실패: {cmd[:100]}... - 오류: {str(e)}")
                    raise
        
        logging.info(f"복원 완료: {backup_file}")
        return True
        

        
        
    except subprocess.CalledProcessError as e:
        logging.error(f"복원 실패: {e.stderr}")
        return False
    except Exception as e:
        logging.error(f"오류 발생: {str(e)}")
        return False

def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(description='PostgreSQL 데이터베이스 복원 스크립트')
    parser.add_argument('backup_file', nargs='?', help='복원할 백업 파일 경로 (지정하지 않으면 최신 백업 파일 사용)')
    parser.add_argument('--dry-run', action='store_true', help='실제 복원 없이 명령만 표시')
    args = parser.parse_args()
    
    # 백업 파일 결정
    backup_file = args.backup_file
    if not backup_file:
        backup_file = get_latest_backup_file()
        if not backup_file:
            logging.error("백업 파일을 찾을 수 없습니다.")
            sys.exit(1)
    elif not os.path.isabs(backup_file):
        # 상대 경로인 경우 백업 디렉토리 기준으로 처리
        backup_dir = get_backup_directory()
        backup_file = os.path.join(backup_dir, backup_file)
    
    if not os.path.exists(backup_file):
        logging.error(f"백업 파일이 존재하지 않습니다: {backup_file}")
        sys.exit(1)
    
    # 복원 확인
    if not confirm_restore(backup_file, args.dry_run):
        logging.info("복원이 취소되었습니다.")
        sys.exit(0)
    
    # 복원 실행
    success = restore_database(backup_file, args.dry_run)
    
    if success:
        if args.dry_run:
            logging.info("드라이 런 모드: 복원 명령이 성공적으로 확인되었습니다.")
        else:
            logging.info("데이터베이스 복원이 성공적으로 완료되었습니다.")
        sys.exit(0)
    else:
        logging.error("데이터베이스 복원 중 오류가 발생했습니다.")
        sys.exit(1)

if __name__ == "__main__":
    main()