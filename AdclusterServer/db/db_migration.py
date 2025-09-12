import os
import sys
import datetime
import argparse
import psycopg2
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

# 데이터베이스 설정
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "nicchals")
DB_PASSWORD = os.getenv("DB_PASSWORD", "a770405z")
DB_NAME = os.getenv("DB_NAME", "adcluster_db")

# 마이그레이션 디렉토리 설정
MIGRATION_DIR = "./migrations"


def ensure_migration_dir():
    """마이그레이션 디렉토리가 존재하는지 확인하고 없으면 생성"""
    if not os.path.exists(MIGRATION_DIR):
        os.makedirs(MIGRATION_DIR)
        print(f"마이그레이션 디렉토리 '{MIGRATION_DIR}'를 생성했습니다.")


def ensure_migration_table():
    """마이그레이션 이력을 저장할 테이블이 존재하는지 확인하고 없으면 생성"""
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME
        )
        cursor = conn.cursor()
        
        # 마이그레이션 테이블 생성
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                version VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                description TEXT
            )
        """)
        
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"마이그레이션 테이블 생성 오류: {e}")
        if conn:
            conn.rollback()
        sys.exit(1)
    finally:
        if conn:
            conn.close()


def get_applied_migrations():
    """적용된 마이그레이션 목록 가져오기"""
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME
        )
        cursor = conn.cursor()
        
        cursor.execute("SELECT version FROM schema_migrations ORDER BY version ASC")
        applied = [row[0] for row in cursor.fetchall()]
        
        cursor.close()
        return applied
    except Exception as e:
        print(f"적용된 마이그레이션 조회 오류: {e}")
        if conn:
            conn.rollback()
        return []
    finally:
        if conn:
            conn.close()


def get_available_migrations():
    """사용 가능한 마이그레이션 파일 목록 가져오기"""
    ensure_migration_dir()
    
    # SQL 파일만 필터링하고 버전 순으로 정렬
    migrations = [f for f in os.listdir(MIGRATION_DIR) if f.endswith(".sql")]
    migrations.sort()
    
    return migrations


def create_migration(name):
    """새 마이그레이션 파일 생성"""
    ensure_migration_dir()
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{name}.sql"
    filepath = os.path.join(MIGRATION_DIR, filename)
    
    with open(filepath, "w") as f:
        f.write("-- 마이그레이션: " + name + "\n")
        f.write("-- 생성 시간: " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\n\n")
        f.write("-- 업그레이드\n")
        f.write("-- 여기에 SQL 문을 작성하세요\n\n")
        f.write("-- 롤백\n")
        f.write("-- 여기에 롤백 SQL 문을 작성하세요\n")
    
    print(f"새 마이그레이션 파일이 생성되었습니다: {filepath}")
    return filepath


def apply_migration(migration_file):
    """마이그레이션 적용"""
    filepath = os.path.join(MIGRATION_DIR, migration_file)
    
    if not os.path.exists(filepath):
        print(f"마이그레이션 파일을 찾을 수 없습니다: {filepath}")
        return False
    
    # 파일에서 SQL 읽기
    with open(filepath, "r") as f:
        content = f.read()
    
    # 업그레이드 SQL 추출 (-- 업그레이드와 -- 롤백 사이의 내용)
    upgrade_sql = ""
    in_upgrade_section = False
    
    for line in content.split("\n"):
        if line.strip().startswith("-- 업그레이드"):
            in_upgrade_section = True
            continue
        elif line.strip().startswith("-- 롤백"):
            in_upgrade_section = False
            continue
        
        if in_upgrade_section and line.strip() and not line.strip().startswith("--"):
            upgrade_sql += line + "\n"
    
    if not upgrade_sql.strip():
        print(f"경고: {migration_file}에 실행할 SQL이 없습니다.")
        return False
    
    # 버전 추출 (파일명의 타임스탬프 부분)
    version = migration_file.split("_")[0]
    description = "_".join(migration_file.split("_")[1:]).replace(".sql", "")
    
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME
        )
        cursor = conn.cursor()
        
        # 트랜잭션 시작
        print(f"마이그레이션 적용 중: {migration_file}")
        
        # SQL 실행
        cursor.execute(upgrade_sql)
        
        # 마이그레이션 이력 기록
        cursor.execute(
            "INSERT INTO schema_migrations (version, description) VALUES (%s, %s)",
            (version, description)
        )
        
        conn.commit()
        cursor.close()
        print(f"마이그레이션이 성공적으로 적용되었습니다: {migration_file}")
        return True
    except Exception as e:
        print(f"마이그레이션 적용 오류: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()


def rollback_migration(migration_file):
    """마이그레이션 롤백"""
    filepath = os.path.join(MIGRATION_DIR, migration_file)
    
    if not os.path.exists(filepath):
        print(f"마이그레이션 파일을 찾을 수 없습니다: {filepath}")
        return False
    
    # 파일에서 SQL 읽기
    with open(filepath, "r") as f:
        content = f.read()
    
    # 롤백 SQL 추출 (-- 롤백 이후의 내용)
    rollback_sql = ""
    in_rollback_section = False
    
    for line in content.split("\n"):
        if line.strip().startswith("-- 롤백"):
            in_rollback_section = True
            continue
        
        if in_rollback_section and line.strip() and not line.strip().startswith("--"):
            rollback_sql += line + "\n"
    
    if not rollback_sql.strip():
        print(f"경고: {migration_file}에 롤백 SQL이 없습니다.")
        return False
    
    # 버전 추출 (파일명의 타임스탬프 부분)
    version = migration_file.split("_")[0]
    
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME
        )
        cursor = conn.cursor()
        
        # 트랜잭션 시작
        print(f"마이그레이션 롤백 중: {migration_file}")
        
        # SQL 실행
        cursor.execute(rollback_sql)
        
        # 마이그레이션 이력 삭제
        cursor.execute("DELETE FROM schema_migrations WHERE version = %s", (version,))
        
        conn.commit()
        cursor.close()
        print(f"마이그레이션이 성공적으로 롤백되었습니다: {migration_file}")
        return True
    except Exception as e:
        print(f"마이그레이션 롤백 오류: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()


def migrate(target=None):
    """마이그레이션 실행"""
    ensure_migration_dir()
    ensure_migration_table()
    
    applied = get_applied_migrations()
    available = get_available_migrations()
    
    # 적용되지 않은 마이그레이션 필터링
    pending = [m for m in available if m.split("_")[0] not in [a for a in applied]]
    pending.sort()  # 버전 순으로 정렬
    
    if target:
        # 특정 버전까지만 마이그레이션
        target_index = next((i for i, m in enumerate(pending) if m.startswith(target)), None)
        if target_index is not None:
            pending = pending[:target_index + 1]
        else:
            print(f"대상 버전 {target}을(를) 찾을 수 없습니다.")
            return False
    
    if not pending:
        print("적용할 마이그레이션이 없습니다. 데이터베이스가 최신 상태입니다.")
        return True
    
    print(f"적용할 마이그레이션: {len(pending)}개")
    for migration in pending:
        if not apply_migration(migration):
            print("마이그레이션이 중단되었습니다.")
            return False
    
    print("모든 마이그레이션이 성공적으로 적용되었습니다.")
    return True


def rollback(steps=1):
    """마이그레이션 롤백"""
    ensure_migration_table()
    
    applied = get_applied_migrations()
    available = get_available_migrations()
    
    if not applied:
        print("롤백할 마이그레이션이 없습니다.")
        return True
    
    # 롤백할 마이그레이션 (최신부터 steps 수만큼)
    to_rollback = []
    for version in reversed(applied):
        matching = [m for m in available if m.startswith(version)]
        if matching:
            to_rollback.append(matching[0])
            if len(to_rollback) >= steps:
                break
    
    if not to_rollback:
        print("롤백할 마이그레이션 파일을 찾을 수 없습니다.")
        return False
    
    print(f"롤백할 마이그레이션: {len(to_rollback)}개")
    for migration in to_rollback:
        if not rollback_migration(migration):
            print("롤백이 중단되었습니다.")
            return False
    
    print("롤백이 성공적으로 완료되었습니다.")
    return True


def status():
    """마이그레이션 상태 표시"""
    ensure_migration_dir()
    ensure_migration_table()
    
    applied = get_applied_migrations()
    available = get_available_migrations()
    
    print("\n=== 마이그레이션 상태 ===")
    print(f"적용된 마이그레이션: {len(applied)}개")
    print(f"사용 가능한 마이그레이션: {len(available)}개")
    
    # 적용되지 않은 마이그레이션 계산
    pending = [m for m in available if m.split("_")[0] not in [a for a in applied]]
    print(f"대기 중인 마이그레이션: {len(pending)}개")
    
    if applied:
        print("\n적용된 마이그레이션:")
        for i, version in enumerate(applied, 1):
            matching = [m for m in available if m.startswith(version)]
            if matching:
                print(f"  {i}. {matching[0]}")
            else:
                print(f"  {i}. {version} (파일 없음)")
    
    if pending:
        print("\n대기 중인 마이그레이션:")
        for i, migration in enumerate(pending, 1):
            print(f"  {i}. {migration}")
    
    return True


def interactive_mode():
    """대화형 모드로 마이그레이션 작업 수행"""
    print("\n=== PostgreSQL 데이터베이스 마이그레이션 도구 ===")
    
    while True:
        print("\n작업을 선택하세요:")
        print("1. 마이그레이션 상태 확인")
        print("2. 새 마이그레이션 생성")
        print("3. 마이그레이션 적용")
        print("4. 마이그레이션 롤백")
        print("5. 종료")
        
        choice = input("\n선택 (1-5): ")
        
        if choice == "1":
            status()
        
        elif choice == "2":
            name = input("마이그레이션 이름 (영문, 숫자, 언더스코어만 사용): ")
            if name and all(c.isalnum() or c == '_' for c in name):
                create_migration(name)
            else:
                print("유효하지 않은 이름입니다. 영문, 숫자, 언더스코어만 사용하세요.")
        
        elif choice == "3":
            target = input("특정 버전까지 마이그레이션 (비워두면 모두 적용): ")
            migrate(target if target else None)
        
        elif choice == "4":
            steps_input = input("롤백할 단계 수 (기본값: 1): ")
            try:
                steps = int(steps_input) if steps_input else 1
                if steps > 0:
                    rollback(steps)
                else:
                    print("유효한 단계 수를 입력하세요 (1 이상).")
            except ValueError:
                print("유효한 숫자를 입력하세요.")
        
        elif choice == "5":
            print("프로그램을 종료합니다.")
            break
        
        else:
            print("유효하지 않은 선택입니다. 1-5 사이의 숫자를 입력하세요.")


def main():
    parser = argparse.ArgumentParser(description="PostgreSQL 데이터베이스 마이그레이션 도구")
    subparsers = parser.add_subparsers(dest="command", help="명령")
    
    # 상태 확인 명령
    subparsers.add_parser("status", help="마이그레이션 상태 확인")
    
    # 마이그레이션 생성 명령
    create_parser = subparsers.add_parser("create", help="새 마이그레이션 생성")
    create_parser.add_argument("name", help="마이그레이션 이름")
    
    # 마이그레이션 적용 명령
    migrate_parser = subparsers.add_parser("migrate", help="마이그레이션 적용")
    migrate_parser.add_argument("--target", "-t", help="특정 버전까지 마이그레이션")
    
    # 롤백 명령
    rollback_parser = subparsers.add_parser("rollback", help="마이그레이션 롤백")
    rollback_parser.add_argument("--steps", "-s", type=int, default=1, help="롤백할 단계 수 (기본값: 1)")
    
    # 대화형 모드
    subparsers.add_parser("interactive", help="대화형 모드 실행")
    
    args = parser.parse_args()
    
    if args.command == "status":
        status()
    elif args.command == "create":
        create_migration(args.name)
    elif args.command == "migrate":
        migrate(args.target)
    elif args.command == "rollback":
        rollback(args.steps)
    elif args.command == "interactive":
        interactive_mode()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()