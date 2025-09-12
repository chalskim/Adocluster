import asyncio
import websockets
import requests
import json
import sys
import os

# Context7을 활용한 프롬프트 기반 테스트 코드 생성기
class PromptTestGenerator:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.ws_base_url = "ws://localhost:8000"
    
    async def generate_test_from_prompt(self, prompt):
        """자연어 프롬프트를 기반으로 테스트 코드를 생성합니다."""
        print(f"프롬프트로부터 테스트 코드 생성 중: {prompt}")
        
        # 프롬프트 분석 및 테스트 유형 결정
        test_type = self._analyze_prompt(prompt)
        
        # 테스트 유형에 따라 적절한 테스트 코드 생성
        if test_type == "websocket":
            return self._generate_websocket_test(prompt)
        elif test_type == "api":
            return self._generate_api_test(prompt)
        elif test_type == "auth":
            return self._generate_auth_test(prompt)
        elif test_type == "file_upload":
            return self._generate_file_upload_test(prompt)
        else:
            return self._generate_generic_test(prompt)
    
    def _analyze_prompt(self, prompt):
        """프롬프트를 분석하여 테스트 유형을 결정합니다."""
        prompt_lower = prompt.lower()
        
        if any(keyword in prompt_lower for keyword in ["websocket", "ws", "소켓", "실시간", "연결"]):
            return "websocket"
        elif any(keyword in prompt_lower for keyword in ["api", "엔드포인트", "http", "요청", "응답"]):
            return "api"
        elif any(keyword in prompt_lower for keyword in ["로그인", "인증", "토큰", "권한", "사용자"]):
            return "auth"
        elif any(keyword in prompt_lower for keyword in ["파일", "업로드", "다운로드", "이미지"]):
            return "file_upload"
        else:
            return "generic"
    
    def _generate_websocket_test(self, prompt):
        """웹소켓 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 웹소켓 테스트 코드

import asyncio
import websockets
import json

async def test_websocket_connection():
    uri = "{self.ws_base_url}/ws/999"  # 테스트용 클라이언트 ID
    try:
        async with websockets.connect(uri) as websocket:
            print("웹소켓 서버에 연결되었습니다.")
            
            # 웰컴 메시지 수신
            welcome = await websocket.recv()
            print(f"수신: {welcome}")
            
            # 테스트 메시지 전송
            test_message = "테스트 메시지입니다."
            await websocket.send(test_message)
            print(f"전송: {test_message}")
            
            # 응답 수신
            response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
            print(f"수신: {response}")
            
            print("웹소켓 테스트 완료")
    except Exception as e:
        print(f"웹소켓 테스트 중 오류 발생: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket_connection())
"""
        return test_code
    
    def _generate_api_test(self, prompt):
        """API 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 API 테스트 코드

import requests
import json

def test_api_endpoint():
    base_url = "{self.base_url}"
    
    # GET 요청 테스트
    print("GET 요청 테스트 중...")
    response = requests.get(f"{base_url}/users/")
    print(f"상태 코드: {response.status_code}")
    if response.status_code == 200:
        print(f"응답 데이터: {response.json()}")
    else:
        print(f"오류 응답: {response.text}")
    
    # POST 요청 테스트
    print("\nPOST 요청 테스트 중...")
    test_data = {{
        "name": "테스트 사용자",
        "email": "test@example.com"
    }}
    response = requests.post(f"{base_url}/users/", json=test_data)
    print(f"상태 코드: {response.status_code}")
    if response.status_code in [200, 201]:
        print(f"응답 데이터: {response.json()}")
    else:
        print(f"오류 응답: {response.text}")
    
    print("API 테스트 완료")

if __name__ == "__main__":
    test_api_endpoint()
"""
        return test_code
    
    def _generate_auth_test(self, prompt):
        """인증 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 인증 테스트 코드

import requests
import json

def test_authentication():
    base_url = "{self.base_url}"
    
    # 로그인 테스트
    print("로그인 테스트 중...")
    login_data = {{
        "uemail": "test@example.com",
        "upassword": "testpassword"
    }}
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"상태 코드: {response.status_code}")
    
    if response.status_code == 200:
        token_data = response.json()
        print(f"로그인 성공: {token_data}")
        token = token_data.get("token")
        
        # 토큰을 사용한 인증된 요청 테스트
        print("\n인증된 요청 테스트 중...")
        headers = {{
            "Authorization": f"Bearer {token}"
        }}
        response = requests.get(f"{base_url}/users/me", headers=headers)
        print(f"상태 코드: {response.status_code}")
        if response.status_code == 200:
            print(f"사용자 정보: {response.json()}")
        else:
            print(f"오류 응답: {response.text}")
    else:
        print(f"로그인 실패: {response.text}")
    
    print("인증 테스트 완료")

if __name__ == "__main__":
    test_authentication()
"""
        return test_code
    
    def _generate_file_upload_test(self, prompt):
        """파일 업로드 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 파일 업로드 테스트 코드

import requests
import os

def test_file_upload():
    base_url = "{self.base_url}"
    
    # 테스트 파일 경로
    test_file_path = "test_upload.txt"
    
    # 파일이 없으면 생성
    if not os.path.exists(test_file_path):
        with open(test_file_path, "w") as f:
            f.write("This is a test file for upload testing.")
    
    print(f"파일 업로드 테스트 중... 파일: {test_file_path}")
    
    # 파일 업로드 요청
    with open(test_file_path, "rb") as f:
        files = {{
            "file": (os.path.basename(test_file_path), f, "text/plain")
        }}
        response = requests.post(f"{base_url}/uploads/", files=files)
    
    print(f"상태 코드: {response.status_code}")
    if response.status_code in [200, 201]:
        print(f"업로드 성공: {response.json()}")
    else:
        print(f"업로드 실패: {response.text}")
    
    print("파일 업로드 테스트 완료")

if __name__ == "__main__":
    test_file_upload()
"""
        return test_code
    
    def _generate_generic_test(self, prompt):
        """일반적인 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 일반 테스트 코드

import requests
import websockets
import asyncio
import json
import os

# 동기 테스트 함수
def test_api_functionality():
    base_url = "{self.base_url}"
    print("API 기능 테스트 중...")
    
    # 서버 상태 확인
    try:
        response = requests.get(f"{base_url}/")
        print(f"서버 상태: {response.status_code}")
    except Exception as e:
        print(f"서버 연결 오류: {e}")

# 비동기 테스트 함수
async def test_websocket_functionality():
    uri = "{self.ws_base_url}/ws/888"  # 테스트용 클라이언트 ID
    print("웹소켓 기능 테스트 중...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("웹소켓 서버에 연결됨")
            welcome = await websocket.recv()
            print(f"웰컴 메시지: {welcome}")
    except Exception as e:
        print(f"웹소켓 연결 오류: {e}")

# 메인 테스트 함수
async def run_tests():
    print(f"프롬프트 기반 테스트 시작: {prompt}")
    
    # API 테스트 실행
    test_api_functionality()
    
    # 웹소켓 테스트 실행
    await test_websocket_functionality()
    
    print("테스트 완료")

if __name__ == "__main__":
    asyncio.run(run_tests())
"""
        return test_code

# 명령줄에서 실행할 경우
async def main():
    if len(sys.argv) < 2:
        print("사용법: python prompt_test_generator.py '테스트하고 싶은 기능에 대한 설명'")
        sys.exit(1)
    
    prompt = sys.argv[1]
    generator = PromptTestGenerator()
    test_code = await generator.generate_test_from_prompt(prompt)
    
    # 테스트 코드 출력
    print("\n생성된 테스트 코드:")
    print("=" * 80)
    print(test_code)
    print("=" * 80)
    
    # 테스트 코드 파일로 저장
    output_file = f"generated_test_{int(asyncio.get_event_loop().time())}.py"
    with open(output_file, "w") as f:
        f.write(test_code)
    
    print(f"\n테스트 코드가 {output_file} 파일로 저장되었습니다.")
    print(f"실행 방법: python {output_file}")

if __name__ == "__main__":
    asyncio.run(main())