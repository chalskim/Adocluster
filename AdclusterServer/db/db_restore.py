#!/usr/bin/env python3
"""
PostgreSQL 백업 복원 스크립트

이 스크립트는 PostgreSQL 백업 파일을 데이터베이스에 복원합니다.
pg_dumpall로 생성된 전체 백업 파일을 psql 명령어를 사용하여 복원합니다.

사용법:
    python db_restore.py [백업 파일명]

백업 파일명을 지정하지 않으면 가장 최근의 'full_backup_*.sql' 파일을 사용합니다.
"""

import os
import sys
import glob
import subprocess
import logging
from pathlib import Path
import datetime

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def get_db_credentials():
    """
    .env 파일에서 데이터베이스 접속 정보를 가져옵니다.
    """
    env_path = Path(__file__).parent.parent / '.env'
    credentials = {
        'DB_USER': 'adcluster',
        'DB_PASSWORD': '',
        'DB_HOST': 'localhost',
        'DB_PORT': '5432'
    }
    
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                key, value = line.split('=', 1)
                if key in credentials:
                    credentials[key] = value.strip('"\'')
    
    return credentials

def get_latest_backup():
    """
    가장 최근의 백업 파일을 찾습니다.
    
    Returns:
        str: 가장 최근 백업 파일의 경로 또는 None
    """
    # 백업 폴더 경로 설정 (상위 디렉토리의 dbBackup 폴더)
    backup_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dbBackup'))
    
    # 백업 파일 검색
    backup_files = glob.glob(os.path.join(backup_dir, 'full_backup_*.sql'))
    
    if not backup_files:
        return None
    
    # 파일 수정 시간 기준으로 정렬
    backup_files.sort(key=os.path.getmtime, reverse=True)
    return backup_files[0]

def restore_backup(backup_file, dry_run=False):
    """
    백업 파일을 데이터베이스에 복원합니다.
    
    Args:
        backup_file (str): 복원할 백업 파일 경로
        dry_run (bool): 실제 복원을 수행하지 않고 명령만 출력
    
    Returns:
        bool: 복원 성공 여부
    """
    if not os.path.exists(backup_file):
        logging.error(f'백업 파일을 찾을 수 없습니다: {backup_file}')
        return False
    
    # 데이터베이스 접속 정보 가져오기
    credentials = get_db_credentials()
    
    # psql 명령 구성
    cmd = [
        'psql',
        '-U', credentials['DB_USER'],
        '-h', credentials['DB_HOST'],
        '-p', credentials['DB_PORT'],
        '-f', backup_file
    ]
    
    # 환경 변수 설정 (비밀번호)
    env = os.environ.copy()
    if credentials['DB_PASSWORD']:
        env['PGPASSWORD'] = credentials['DB_PASSWORD']
    
    # Dry run 모드인 경우 명령만 출력
    if dry_run:
        logging.info(f'Dry run 모드: 다음 명령이 실행됩니다:')
        cmd_str = ' '.join(cmd)
        if credentials['DB_PASSWORD']:
            # 비밀번호가 있는 경우 환경 변수 설정 표시
            logging.info(f'PGPASSWORD=***** {cmd_str}')
        else:
            logging.info(cmd_str)
        logging.info(f'백업 파일 크기: {os.path.getsize(backup_file) / 1024:.2f} KB')
        return True
    
    try:
        logging.info(f'복원 시작: {backup_file}')
        
        # 복원 실행
        process = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            text=True,
            check=True
        )
        
        logging.info('복원 완료')
        return True
    
    except subprocess.CalledProcessError as e:
        logging.error(f'복원 실패: {e.stderr}')
        return False
    except Exception as e:
        logging.error(f'오류 발생: {str(e)}')
        return False

def confirm_restore():
    """
    사용자에게 복원 작업을 확인합니다.
    
    Returns:
        bool: 사용자가 확인했는지 여부
    """
    print("경고: 데이터베이스 복원은 기존 데이터를 덮어쓰게 됩니다.")
    print("계속하시겠습니까? (y/n)")
    
    response = input().strip().lower()
    return response == 'y' or response == 'yes'

def show_help():
    """
    도움말 메시지를 출력합니다.
    """
    print(f"사용법: python {os.path.basename(__file__)} [옵션] [백업 파일명]")
    print("")
    print("옵션:")
    print("  --help, -h     도움말 메시지 출력")
    print("  --dry-run      실제 복원을 수행하지 않고 명령만 출력")
    print("")
    print("인수:")
    print("  백업 파일명    복원할 백업 파일 이름 (지정하지 않으면 최신 백업 파일 사용)")
    print("                백업 파일은 dbBackup 폴더에서 찾습니다.")
    print("")
    print("예시:")
    print(f"  python {os.path.basename(__file__)}")
    print(f"  python {os.path.basename(__file__)} full_backup_2025-09-06.sql")
    print(f"  python {os.path.basename(__file__)} --dry-run")
    print(f"  python {os.path.basename(__file__)} --dry-run full_backup_2025-09-06.sql")

def main():
    """
    메인 함수
    """
    # 명령행 인수 처리
    args = sys.argv[1:]
    dry_run = False
    backup_file = None
    
    # 옵션 처리
    i = 0
    while i < len(args):
        if args[i] in ['--help', '-h']:
            show_help()
            sys.exit(0)
        elif args[i] == '--dry-run':
            dry_run = True
            args.pop(i)
        else:
            i += 1
    
    # 처리되지 않은 인수 중 첫 번째를 백업 파일로 간주
    if args:
        # 백업 폴더 경로 설정 (상위 디렉토리의 dbBackup 폴더)
        backup_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dbBackup'))
        
        # 사용자가 파일 이름만 입력한 경우 dbBackup 폴더 경로를 추가
        if not os.path.dirname(args[0]):
            backup_file = os.path.join(backup_dir, args[0])
        else:
            backup_file = args[0]
    else:
        backup_file = get_latest_backup()
        if not backup_file:
            logging.error('백업 파일을 찾을 수 없습니다.')
            sys.exit(1)
        logging.info(f'최신 백업 파일을 사용합니다: {backup_file}')
    
    # dry-run 모드가 아닌 경우에만 사용자 확인
    if not dry_run and not confirm_restore():
        logging.info('복원 작업이 취소되었습니다.')
        sys.exit(0)
    
    # 백업 복원
    success = restore_backup(backup_file, dry_run)
    
    # 종료 코드 설정
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()