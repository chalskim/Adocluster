#!/usr/bin/env python

import os
import sys
import subprocess

def check_dependencies():
    """필요한 패키지가 설치되어 있는지 확인"""
    required_packages = ["psycopg2", "pandas", "matplotlib", "pandastable"]
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    return missing_packages

def main():
    # 필요한 패키지 확인
    missing_packages = check_dependencies()
    
    if missing_packages:
        print("일부 필수 패키지가 설치되어 있지 않습니다:")
        for package in missing_packages:
            print(f"  - {package}")
        
        # 패키지 설치 여부 확인
        install = input("필요한 패키지를 설치하시겠습니까? (y/n): ")
        if install.lower() == 'y':
            print("패키지 설치 중...")
            subprocess.call([sys.executable, "install_gui_dependencies.py"])
        else:
            print("필요한 패키지가 설치되어 있지 않아 프로그램을 실행할 수 없습니다.")
            return
    
    # .env 파일 확인
    if not os.path.exists(".env"):
        print("경고: .env 파일이 없습니다. 데이터베이스 연결 정보를 설정해야 합니다.")
        create_env = input(".env 파일을 생성하시겠습니까? (y/n): ")
        
        if create_env.lower() == 'y':
            host = input("데이터베이스 호스트 (기본값: localhost): ") or "localhost"
            port = input("데이터베이스 포트 (기본값: 5432): ") or "5432"
            name = input("데이터베이스 이름: ")
            user = input("데이터베이스 사용자 이름: ")
            password = input("데이터베이스 비밀번호: ")
            
            with open(".env", "w") as f:
                f.write(f"DB_HOST={host}\n")
                f.write(f"DB_PORT={port}\n")
                f.write(f"DB_NAME={name}\n")
                f.write(f"DB_USER={user}\n")
                f.write(f"DB_PASSWORD={password}\n")
            
            print(".env 파일이 생성되었습니다.")
    
    # GUI 애플리케이션 실행
    print("PostgreSQL 쿼리 실행기 GUI를 시작합니다...")
    subprocess.call([sys.executable, "db_gui.py"])

if __name__ == "__main__":
    main()