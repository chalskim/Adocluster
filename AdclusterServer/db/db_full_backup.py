#!/usr/bin/env python3
"""
PostgreSQL 전체 백업 스크립트

이 스크립트는 PostgreSQL 데이터베이스의 전체 백업을 수행합니다.
pg_dumpall 명령어를 사용하여 모든 데이터베이스, 롤, 테이블스페이스 등을 백업합니다.

사용법:
    python db_full_backup.py [백업 파일명]

백업 파일명을 지정하지 않으면 'full_backup_YYYY-MM-DD.sql' 형식으로 저장됩니다.
"""

import os
import sys
import subprocess
import datetime
import logging
from pathlib import Path

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

def create_backup(backup_file=None):
    """
    pg_dumpall을 사용하여 PostgreSQL 전체 백업을 수행합니다.
    
    Args:
        backup_file (str, optional): 백업 파일 경로. 지정하지 않으면 날짜 기반으로 생성됩니다.
    
    Returns:
        bool: 백업 성공 여부
    """
    # 백업 폴더 경로 설정 (상위 디렉토리의 dbBackup 폴더)
    backup_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dbBackup'))
    
    # 백업 폴더가 없으면 생성
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    # 백업 파일명 설정
    if not backup_file:
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        backup_file = f'full_backup_{today}.sql'
    
    # 백업 파일 경로 설정
    backup_path = os.path.join(backup_dir, backup_file)
    
    # 데이터베이스 접속 정보 가져오기
    credentials = get_db_credentials()
    
    # pg_dumpall 명령 구성
    cmd = [
        'pg_dumpall',
        '-U', credentials['DB_USER'],
        '-h', credentials['DB_HOST'],
        '-p', credentials['DB_PORT'],
    ]
    
    # 환경 변수 설정 (비밀번호)
    env = os.environ.copy()
    if credentials['DB_PASSWORD']:
        env['PGPASSWORD'] = credentials['DB_PASSWORD']
    
    try:
        logging.info(f'백업 시작: {backup_path}')
        
        # 백업 실행
        with open(backup_path, 'w') as f:
            process = subprocess.run(
                cmd,
                stdout=f,
                stderr=subprocess.PIPE,
                env=env,
                text=True,
                check=True
            )
        
        logging.info(f'백업 완료: {backup_path}')
        logging.info(f'백업 파일 크기: {os.path.getsize(backup_path) / 1024:.2f} KB')
        return True
    
    except subprocess.CalledProcessError as e:
        logging.error(f'백업 실패: {e.stderr}')
        return False
    except Exception as e:
        logging.error(f'오류 발생: {str(e)}')
        return False

def main():
    """
    메인 함수
    """
    # 명령행 인수 처리
    if len(sys.argv) > 1:
        backup_file = sys.argv[1]
    else:
        backup_file = None
    
    # 백업 실행
    success = create_backup(backup_file)
    
    # 종료 코드 설정
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()