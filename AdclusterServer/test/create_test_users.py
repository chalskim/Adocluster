from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# 상위 디렉토리를 시스템 경로에 추가하여 app 모듈을 임포트할 수 있게 함
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.user import User
from app.core.security import get_password_hash
from app.core.database import Base
from datetime import datetime
import uuid

# 데이터베이스 연결 설정
DATABASE_URL = "postgresql://adcluster:a770405z@localhost:5432/adcluster_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 테스트 사용자 데이터
test_users = [
    {"uemail": "test1@example.com", "uname": "테스트 사용자 1", "urole": "user"},
    {"uemail": "test2@example.com", "uname": "테스트 사용자 2", "urole": "user"},
    {"uemail": "test3@example.com", "uname": "테스트 사용자 3", "urole": "user"},
    {"uemail": "test4@example.com", "uname": "테스트 사용자 4", "urole": "user"},
    {"uemail": "test5@example.com", "uname": "테스트 사용자 5", "urole": "user"},
    {"uemail": "test6@example.com", "uname": "테스트 사용자 6", "urole": "user"},
    {"uemail": "test7@example.com", "uname": "테스트 사용자 7", "urole": "user"},
    {"uemail": "admin1@example.com", "uname": "관리자 1", "urole": "admin"},
    {"uemail": "admin2@example.com", "uname": "관리자 2", "urole": "admin"},
    {"uemail": "viewer1@example.com", "uname": "뷰어 1", "urole": "viewer"},
]

def create_test_users():
    # 데이터베이스 세션 생성
    db = SessionLocal()
    
    # 공통 비밀번호 해시
    hashed_password = get_password_hash("a770405z")
    
    try:
        # 기존 사용자 확인 및 생성
        for user_data in test_users:
            # 이메일로 기존 사용자 확인
            existing_user = db.query(User).filter(User.uemail == user_data["uemail"]).first()
            
            if existing_user:
                print(f"사용자 {user_data['uemail']}가 이미 존재합니다. 비밀번호를 업데이트합니다.")
                existing_user.upassword = hashed_password
                existing_user.uupdated_at = datetime.utcnow()
            else:
                # 새 사용자 생성
                new_user = User(
                    uid=uuid.uuid4(),
                    uemail=user_data["uemail"],
                    uname=user_data["uname"],
                    urole=user_data["urole"],
                    upassword=hashed_password,
                    uactive=True,
                    uisdel=False,
                    ucreate_at=datetime.utcnow(),
                    uupdated_at=datetime.utcnow()
                )
                db.add(new_user)
                print(f"새 사용자 {user_data['uemail']}를 생성했습니다.")
        
        # 변경사항 커밋
        db.commit()
        print("모든 테스트 사용자가 성공적으로 생성되었습니다.")
        
    except Exception as e:
        db.rollback()
        print(f"오류 발생: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()