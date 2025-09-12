import os
import json
import requests
from datetime import datetime
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GitHubIntegration:
    def __init__(self, token=None, repo_owner=None, repo_name=None):
        # GitHub 설정
        self.token = token or os.environ.get('GITHUB_TOKEN')
        self.repo_owner = repo_owner or os.environ.get('GITHUB_REPO_OWNER')
        self.repo_name = repo_name or os.environ.get('GITHUB_REPO_NAME')
        self.api_base_url = "https://api.github.com"
        
        if not all([self.token, self.repo_owner, self.repo_name]):
            logger.warning("GitHub 통합을 위한 설정이 완전하지 않습니다. 토큰, 저장소 소유자, 저장소 이름이 필요합니다.")
    
    def create_or_update_file(self, file_path, content, commit_message=None):
        """GitHub 저장소에 파일을 생성하거나 업데이트합니다."""
        if not all([self.token, self.repo_owner, self.repo_name]):
            logger.error("GitHub 통합을 위한 설정이 완전하지 않습니다.")
            return False
        
        # 기본 커밋 메시지
        if not commit_message:
            commit_message = f"Update {file_path} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        # API 엔드포인트
        url = f"{self.api_base_url}/repos/{self.repo_owner}/{self.repo_name}/contents/{file_path}"
        
        # 헤더 설정
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        # 파일이 이미 존재하는지 확인
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                # 파일이 존재하면 SHA 가져오기
                file_sha = response.json()["sha"]
                
                # 파일 업데이트
                data = {
                    "message": commit_message,
                    "content": content.encode("utf-8").hex(),
                    "sha": file_sha
                }
                
                response = requests.put(url, headers=headers, json=data)
            else:
                # 파일이 존재하지 않으면 새로 생성
                data = {
                    "message": commit_message,
                    "content": content.encode("utf-8").hex()
                }
                
                response = requests.put(url, headers=headers, json=data)
            
            if response.status_code in [200, 201]:
                logger.info(f"파일 {file_path}이(가) GitHub에 성공적으로 저장되었습니다.")
                return True
            else:
                logger.error(f"GitHub 파일 저장 실패: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"GitHub 파일 저장 중 오류 발생: {e}")
            return False
    
    def save_test_to_github(self, prompt, test_code, test_type):
        """테스트 코드를 GitHub 저장소에 저장합니다."""
        # 파일 경로 생성
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        file_name = f"test_{test_type}_{timestamp}.py"
        file_path = f"tests/generated/{file_name}"
        
        # 커밋 메시지
        commit_message = f"Add {test_type} test generated from prompt"
        
        # 파일 내용에 메타데이터 추가
        file_content = f"""# 생성 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
# 프롬프트: {prompt}
# 테스트 유형: {test_type}

{test_code}
"""
        
        # GitHub에 저장
        return self.create_or_update_file(file_path, file_content, commit_message)
    
    def create_workflow_file(self):
        """GitHub Actions 워크플로우 파일을 생성합니다."""
        workflow_path = ".github/workflows/run_tests.yml"
        
        workflow_content = """name: Run Generated Tests

on:
  push:
    paths:
      - 'tests/generated/**'
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
          pip install pytest
      
      - name: Run tests
        run: |
          pytest tests/generated/
"""
        
        return self.create_or_update_file(workflow_path, workflow_content, "Add test workflow")

# 사용 예시
def save_test_to_github(prompt, test_code, test_type):
    """테스트 코드를 GitHub에 저장하는 헬퍼 함수"""
    github = GitHubIntegration()
    return github.save_test_to_github(prompt, test_code, test_type)

if __name__ == "__main__":
    # 테스트 코드
    test_prompt = "웹소켓 연결 테스트 코드 생성"
    test_code = """import websockets
import asyncio

async def test_websocket():
    uri = "ws://localhost:8000/ws/123"
    async with websockets.connect(uri) as websocket:
        await websocket.send("Hello!")
        response = await websocket.recv()
        print(f"Received: {response}")

asyncio.run(test_websocket())
"""
    test_type = "websocket"
    
    # GitHub에 저장
    github = GitHubIntegration()
    result = github.save_test_to_github(test_prompt, test_code, test_type)
    
    if result:
        print("테스트 코드가 GitHub에 성공적으로 저장되었습니다.")
    else:
        print("GitHub 저장 실패")
    
    # 워크플로우 파일 생성
    workflow_result = github.create_workflow_file()
    if workflow_result:
        print("GitHub Actions 워크플로우 파일이 생성되었습니다.")
    else:
        print("워크플로우 파일 생성 실패")