import os
import sys
import subprocess
import importlib.util

def check_package(package_name):
    """패키지가 설치되어 있는지 확인"""
    return importlib.util.find_spec(package_name) is not None

def install_package(package_name):
    """패키지 설치"""
    print(f"{package_name} 패키지를 설치합니다...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        print(f"{package_name} 설치 완료")
        return True
    except subprocess.CalledProcessError:
        print(f"{package_name} 설치 실패")
        return False

def check_and_install_dependencies():
    """필요한 패키지 확인 및 설치"""
    required_packages = ["flask", "psycopg2", "dotenv", "pandas", "matplotlib"]
    missing_packages = [pkg for pkg in required_packages if not check_package(pkg)]
    
    if missing_packages:
        print("일부 필수 패키지가 설치되어 있지 않습니다.")
        install_choice = input("필요한 패키지를 설치하시겠습니까? (y/n): ").lower()
        
        if install_choice == 'y':
            for package in missing_packages:
                if package == "dotenv":
                    package = "python-dotenv"  # 실제 패키지 이름은 python-dotenv
                if not install_package(package):
                    print(f"{package} 설치에 실패했습니다. 수동으로 설치해주세요.")
                    print(f"명령어: pip install {package}")
                    return False
            return True
        else:
            print("패키지 설치를 건너뛰었습니다. 애플리케이션이 제대로 작동하지 않을 수 있습니다.")
            return False
    
    return True

def check_env_file():
    """환경 변수 파일 확인"""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    
    if not os.path.exists(env_path):
        print(".env 파일이 존재하지 않습니다. 데이터베이스 연결 정보를 설정해야 합니다.")
        create_choice = input(".env 파일을 생성하시겠습니까? (y/n): ").lower()
        
        if create_choice == 'y':
            db_host = input("데이터베이스 호스트 (기본값: localhost): ") or "localhost"
            db_port = input("데이터베이스 포트 (기본값: 5432): ") or "5432"
            db_name = input("데이터베이스 이름: ")
            db_user = input("데이터베이스 사용자: ")
            db_password = input("데이터베이스 비밀번호: ")
            
            with open(env_path, "w") as env_file:
                env_file.write(f"DB_HOST={db_host}\n")
                env_file.write(f"DB_PORT={db_port}\n")
                env_file.write(f"DB_NAME={db_name}\n")
                env_file.write(f"DB_USER={db_user}\n")
                env_file.write(f"DB_PASSWORD={db_password}\n")
            
            print(".env 파일이 생성되었습니다.")
            return True
        else:
            print(".env 파일 생성을 건너뛰었습니다. 애플리케이션이 제대로 작동하지 않을 수 있습니다.")
            return False
    
    return True

def run_web_gui():
    """웹 GUI 실행"""
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db_web_gui.py")
    
    if not os.path.exists(script_path):
        print(f"오류: {script_path} 파일을 찾을 수 없습니다.")
        return False
    
    print("PostgreSQL 웹 GUI를 실행합니다...")
    print("웹 브라우저에서 http://localhost:5000 으로 접속하세요.")
    
    try:
        subprocess.run([sys.executable, script_path])
        return True
    except Exception as e:
        print(f"웹 GUI 실행 중 오류가 발생했습니다: {e}")
        return False

def main():
    print("PostgreSQL 웹 GUI 시작 도우미")
    print("-" * 30)
    
    # 의존성 확인 및 설치
    if not check_and_install_dependencies():
        print("필요한 패키지가 설치되지 않아 진행할 수 없습니다.")
        return
    
    # 환경 변수 파일 확인
    if not check_env_file():
        print("환경 변수 설정이 완료되지 않아 진행할 수 없습니다.")
        return
    
    # 웹 GUI 실행
    run_web_gui()

if __name__ == "__main__":
    main()