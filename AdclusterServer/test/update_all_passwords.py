from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# 상위 디렉토리를 시스템 경로에 추가하여 app 모듈을 임포트할 수 있게 함
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.user import User
from app.core.security import get_password_hash
from datetime import datetime

# 데이터베이스 연결 설정
DATABASE_URL = "postgresql://adcluster:a770405z@localhost:5432/adcluster_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def update_all_passwords():
    # 데이터베이스 세션 생성
    db = SessionLocal()
    
    # 공통 비밀번호 해시
    hashed_password = get_password_hash("a770405z")
    
    try:
        # 모든 사용자 조회
        users = db.query(User).all()
        
        if not users:
            print("데이터베이스에 사용자가 없습니다.")
            return
        
        # 각 사용자의 비밀번호 업데이트
        for user in users:
            user.upassword = hashed_password
            user.uupdated_at = datetime.utcnow()
            print(f"사용자 {user.uemail}의 비밀번호를 업데이트했습니다.")
        
        # 변경사항 커밋
        db.commit()
        print(f"총 {len(users)}명의 사용자 비밀번호가 'a770405z'로 변경되었습니다.")
        
    except Exception as e:
        db.rollback()
        print(f"오류 발생: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_all_passwords()