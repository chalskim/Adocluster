import subprocess
import sys
import os

def install_dependencies():
    print("PostgreSQL 웹 GUI 애플리케이션에 필요한 패키지를 설치합니다...")
    
    # 필요한 패키지 목록
    packages = [
        "flask",
        "psycopg2-binary",
        "python-dotenv",
        "pandas",
        "matplotlib"
    ]
    
    # pip를 사용하여 패키지 설치
    for package in packages:
        print(f"{package} 설치 중...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"{package} 설치 완료")
        except subprocess.CalledProcessError:
            print(f"{package} 설치 실패")
            return False
    
    print("\n모든 패키지가 성공적으로 설치되었습니다!")
    print("\n웹 GUI를 실행하려면 다음 명령어를 실행하세요:")
    print("python db_web_gui.py")
    return True

if __name__ == "__main__":
    install_dependencies()