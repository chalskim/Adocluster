import subprocess
import sys

def install_dependencies():
    """GUI 애플리케이션에 필요한 패키지 설치"""
    dependencies = [
        "psycopg2-binary",  # PostgreSQL 연결
        "python-dotenv",   # 환경 변수 로드
        "pandas",          # 데이터 처리
        "matplotlib",      # 차트 생성
        "pandastable"      # 테이블 뷰
    ]
    
    print("PostgreSQL GUI 애플리케이션에 필요한 패키지를 설치합니다...")
    
    for package in dependencies:
        print(f"\n{package} 설치 중...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"{package} 설치 완료!")
        except subprocess.CalledProcessError as e:
            print(f"{package} 설치 중 오류가 발생했습니다: {e}")
            return False
    
    print("\n모든 패키지가 성공적으로 설치되었습니다!")
    print("\nGUI 애플리케이션을 실행하려면 다음 명령어를 입력하세요:")
    print("python db_gui.py")
    return True

if __name__ == "__main__":
    install_dependencies()