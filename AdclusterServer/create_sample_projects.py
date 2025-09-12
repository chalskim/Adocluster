import sys
import os
import uuid
from datetime import date, timedelta

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.project import Project
from app.models.user import User

def create_sample_projects():
    # Get database session
    db_gen = get_db()
    db = next(db_gen)
    
    try:
        # First, let's get some existing users to be project creators
        users = db.query(User).limit(5).all()
        
        if not users:
            print("No users found in the database. Please create some users first.")
            return
        
        # Sample project data
        sample_projects = [
            {
                "title": "웹사이트 리디자인 프로젝트",
                "description": "회사 웹사이트의 전체 리디자인 작업을 수행합니다. 새로운 UI/UX 디자인과 반응형 웹 개발이 포함됩니다.",
                "visibility": "team",
                "start_date": date.today(),
                "end_date": date.today() + timedelta(days=60)
            },
            {
                "title": "모바일 앱 개발",
                "description": "iOS 및 Android 플랫폼용 모바일 애플리케이션을 개발합니다. React Native를 사용하여 크로스 플랫폼 앱을 구현합니다.",
                "visibility": "team",
                "start_date": date.today() - timedelta(days=10),
                "end_date": date.today() + timedelta(days=90)
            },
            {
                "title": "데이터 분석 시스템 구축",
                "description": "대용량 데이터를 처리하고 분석할 수 있는 시스템을 구축합니다. Python과 Apache Spark를 사용합니다.",
                "visibility": "private",
                "start_date": date.today() - timedelta(days=30),
                "end_date": date.today() + timedelta(days=120)
            },
            {
                "title": "사내 교육 플랫폼 개발",
                "description": "직원 교육을 위한 온라인 학습 관리 시스템(LMS)을 개발합니다. 비디오 스트리밍과 퀴즈 기능이 포함됩니다.",
                "visibility": "company",
                "start_date": date.today(),
                "end_date": date.today() + timedelta(days=180)
            },
            {
                "title": "電子郵함 마이그레이션 프로젝트",
                "description": "기존 이메일 시스템을 새로운 클라우드 기반 솔루션으로 마이그레이션합니다. 데이터 이전과 사용자 교육이 포함됩니다.",
                "visibility": "team",
                "start_date": date.today() - timedelta(days=5),
                "end_date": date.today() + timedelta(days=45)
            }
        ]
        
        # Create projects for each user
        created_projects = []
        for i, project_data in enumerate(sample_projects):
            # Rotate through users for creators
            creator = users[i % len(users)]
            
            # Create new project
            new_project = Project(
                prjid=uuid.uuid4(),
                crtid=creator.uid,
                title=project_data["title"],
                description=project_data["description"],
                visibility=project_data["visibility"],
                start_date=project_data["start_date"],
                end_date=project_data["end_date"]
            )
            
            db.add(new_project)
            created_projects.append(new_project)
        
        # Commit all changes
        db.commit()
        
        # Refresh to get the created IDs
        for project in created_projects:
            db.refresh(project)
        
        print(f"Successfully created {len(created_projects)} sample projects:")
        for project in created_projects:
            # Find the user who created this project
            creator = next((u for u in users if u.uid == project.crtid), None)
            creator_name = creator.uname if creator else "Unknown"
            
            print(f"  - {project.title} (ID: {project.prjid}) created by {creator_name}")
            
        return created_projects
        
    except Exception as e:
        print(f"Error creating sample projects: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_projects()