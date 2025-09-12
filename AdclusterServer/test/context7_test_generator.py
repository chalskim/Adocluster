import asyncio
import json
import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

# Context7과 PostgreSQL을 활용한 테스트 코드 생성기
class Context7TestGenerator:
    def __init__(self, db_config=None):
        # 기본 데이터베이스 설정
        self.db_config = db_config or {
            'dbname': 'adcluster',
            'user': 'postgres',
            'password': 'postgres',
            'host': 'localhost',
            'port': '5432'
        }
        self.base_url = "http://localhost:8000"
        self.ws_base_url = "ws://localhost:8000"
    
    def connect_to_db(self):
        """PostgreSQL 데이터베이스에 연결합니다."""
        try:
            conn = psycopg2.connect(**self.db_config)
            return conn
        except Exception as e:
            print(f"데이터베이스 연결 오류: {e}")
            return None
    
    def save_test_to_db(self, prompt, test_code, test_type):
        """생성된 테스트 코드를 데이터베이스에 저장합니다."""
        conn = self.connect_to_db()
        if not conn:
            return False
        
        try:
            with conn.cursor() as cursor:
                # 테스트 코드 저장 테이블이 없으면 생성
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS test_codes (
                    id SERIAL PRIMARY KEY,
                    prompt TEXT NOT NULL,
                    test_code TEXT NOT NULL,
                    test_type VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """)
                
                # 테스트 코드 저장
                cursor.execute("""
                INSERT INTO test_codes (prompt, test_code, test_type)
                VALUES (%s, %s, %s)
                RETURNING id
                """, (prompt, test_code, test_type))
                
                test_id = cursor.fetchone()[0]
                conn.commit()
                print(f"테스트 코드가 데이터베이스에 저장되었습니다. ID: {test_id}")
                return test_id
        except Exception as e:
            print(f"데이터베이스 저장 오류: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    def get_test_from_db(self, test_id):
        """데이터베이스에서 테스트 코드를 가져옵니다."""
        conn = self.connect_to_db()
        if not conn:
            return None
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                SELECT * FROM test_codes WHERE id = %s
                """, (test_id,))
                
                test = cursor.fetchone()
                return dict(test) if test else None
        except Exception as e:
            print(f"데이터베이스 조회 오류: {e}")
            return None
        finally:
            conn.close()
    
    def analyze_prompt_with_context7(self, prompt):
        """Context7을 사용하여 프롬프트를 분석합니다."""
        # 여기서는 간단한 키워드 기반 분석을 사용하지만,
        # 실제로는 Context7 API를 호출하여 더 정교한 분석을 수행할 수 있습니다.
        prompt_lower = prompt.lower()
        
        if any(keyword in prompt_lower for keyword in ["websocket", "ws", "소켓", "실시간", "연결"]):
            return "websocket"
        elif any(keyword in prompt_lower for keyword in ["api", "엔드포인트", "http", "요청", "응답"]):
            return "api"
        elif any(keyword in prompt_lower for keyword in ["로그인", "인증", "토큰", "권한", "사용자"]):
            return "auth"
        elif any(keyword in prompt_lower for keyword in ["파일", "업로드", "다운로드", "이미지"]):
            return "file_upload"
        elif any(keyword in prompt_lower for keyword in ["데이터베이스", "db", "sql", "쿼리"]):
            return "database"
        elif any(keyword in prompt_lower for keyword in ["워크플로우", "workflow", "순서", "프로세스"]):
            return "workflow"
        else:
            return "generic"
    
    def generate_test_code(self, prompt, test_type):
        """테스트 유형에 따라 테스트 코드를 생성합니다."""
        if test_type == "websocket":
            return self._generate_websocket_test(prompt)
        elif test_type == "api":
            return self._generate_api_test(prompt)
        elif test_type == "auth":
            return self._generate_auth_test(prompt)
        elif test_type == "file_upload":
            return self._generate_file_upload_test(prompt)
        elif test_type == "database":
            return self._generate_database_test(prompt)
        elif test_type == "workflow":
            return self._generate_workflow_test(prompt)
        else:
            return self._generate_generic_test(prompt)
    
    def _generate_websocket_test(self, prompt):
        """웹소켓 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 웹소켓 테스트 코드

import asyncio
import websockets
import json
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_websocket_connection():
    uri = "{self.ws_base_url}/ws/999"  # 테스트용 클라이언트 ID
    logger.info(f"웹소켓 연결 시도: {{uri}}")
    
    try:
        async with websockets.connect(uri) as websocket:
            logger.info("웹소켓 서버에 연결되었습니다.")
            
            # 웰컴 메시지 수신
            welcome = await websocket.recv()
            logger.info(f"수신: {{welcome}}")
            
            # 테스트 메시지 전송
            test_message = "테스트 메시지입니다."
            await websocket.send(test_message)
            logger.info(f"전송: {{test_message}}")
            
            # 응답 수신
            response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
            logger.info(f"수신: {{response}}")
            
            # 다른 클라이언트에게 메시지 전송 테스트
            await websocket.send("/send_to 888 안녕하세요, 테스트 메시지입니다.")
            logger.info("다른 클라이언트에게 메시지 전송 명령 실행")
            
            # 응답 수신
            try:
                cmd_response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                logger.info(f"명령 응답: {{cmd_response}}")
            except asyncio.TimeoutError:
                logger.warning("명령 응답 수신 시간 초과")
            
            logger.info("웹소켓 테스트 완료")
    except Exception as e:
        logger.error(f"웹소켓 테스트 중 오류 발생: {{e}}")

async def test_multiple_clients():
    logger.info("다중 클라이언트 테스트 시작")
    
    # 두 개의 클라이언트 연결
    uri1 = f"{self.ws_base_url}/ws/888"
    uri2 = f"{self.ws_base_url}/ws/999"
    
    try:
        # 첫 번째 클라이언트 연결
        client1 = await websockets.connect(uri1)
        logger.info("클라이언트 1 연결됨")
        welcome1 = await client1.recv()
        logger.info(f"클라이언트 1 웰컴 메시지: {{welcome1}}")
        
        # 두 번째 클라이언트 연결
        client2 = await websockets.connect(uri2)
        logger.info("클라이언트 2 연결됨")
        welcome2 = await client2.recv()
        logger.info(f"클라이언트 2 웰컴 메시지: {{welcome2}}")
        
        # 클라이언트 1에서 클라이언트 2로 메시지 전송
        await client1.send("/send_to 999 클라이언트 1에서 보낸 메시지")
        logger.info("클라이언트 1에서 클라이언트 2로 메시지 전송")
        
        # 클라이언트 2에서 메시지 수신
        try:
            message = await asyncio.wait_for(client2.recv(), timeout=2.0)
            logger.info(f"클라이언트 2 수신 메시지: {{message}}")
        except asyncio.TimeoutError:
            logger.warning("클라이언트 2 메시지 수신 시간 초과")
        
        # 연결 종료
        await client1.close()
        await client2.close()
        logger.info("다중 클라이언트 테스트 완료")
    except Exception as e:
        logger.error(f"다중 클라이언트 테스트 중 오류 발생: {{e}}")

async def run_all_tests():
    logger.info("모든 웹소켓 테스트 시작")
    await test_websocket_connection()
    await asyncio.sleep(1)  # 테스트 간 간격
    await test_multiple_clients()
    logger.info("모든 웹소켓 테스트 완료")

if __name__ == "__main__":
    asyncio.run(run_all_tests())
"""
        return test_code
    
    def _generate_api_test(self, prompt):
        """API 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 API 테스트 코드

import requests
import json
import logging
import unittest

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class APITest(unittest.TestCase):
    def setUp(self):
        self.base_url = "{self.base_url}"
        self.session = requests.Session()
        logger.info(f"API 테스트 설정 완료: {{self.base_url}}")
    
    def tearDown(self):
        self.session.close()
        logger.info("API 테스트 세션 종료")
    
    def test_get_users(self):
        """사용자 목록 조회 API 테스트"""
        logger.info("GET /users/ 테스트 중...")
        response = self.session.get(f"{{self.base_url}}/users/")
        
        logger.info(f"상태 코드: {{response.status_code}}")
        self.assertIn(response.status_code, [200, 401, 403], "예상된 상태 코드가 아닙니다.")
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"응답 데이터: {{data}}")
            self.assertIsInstance(data, list, "응답이 리스트 형식이 아닙니다.")
        elif response.status_code == 401:
            logger.info("인증이 필요합니다. 로그인 후 다시 시도하세요.")
        elif response.status_code == 403:
            logger.info("접근 권한이 없습니다.")
    
    def test_create_user(self):
        """사용자 생성 API 테스트"""
        logger.info("POST /users/ 테스트 중...")
        
        # 테스트 데이터
        test_user = {{
            "uemail": f"test_{{int(time.time())}}@example.com",
            "upassword": "testpassword123",
            "urole": "user"
        }}
        
        response = self.session.post(f"{{self.base_url}}/users/", json=test_user)
        logger.info(f"상태 코드: {{response.status_code}}")
        
        if response.status_code in [200, 201]:
            data = response.json()
            logger.info(f"응답 데이터: {{data}}")
            self.assertIn("uid", data, "응답에 사용자 ID가 없습니다.")
            self.assertEqual(data["uemail"], test_user["uemail"], "이메일이 일치하지 않습니다.")
        else:
            logger.warning(f"사용자 생성 실패: {{response.text}}")
    
    def test_get_user_by_id(self):
        """특정 사용자 조회 API 테스트"""
        # 먼저 사용자 목록을 가져와서 첫 번째 사용자 ID를 사용
        logger.info("특정 사용자 조회 테스트 준비 중...")
        
        # 로그인하여 토큰 획득
        login_data = {{
            "uemail": "admin@example.com",
            "upassword": "adminpassword"
        }}
        login_response = self.session.post(f"{{self.base_url}}/auth/login", json=login_data)
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get("token")
            self.session.headers.update({{
                "Authorization": f"Bearer {{token}}"
            }})
            
            # 사용자 목록 가져오기
            users_response = self.session.get(f"{{self.base_url}}/users/")
            
            if users_response.status_code == 200:
                users = users_response.json()
                if users:
                    user_id = users[0]["uid"]
                    logger.info(f"테스트할 사용자 ID: {{user_id}}")
                    
                    # 특정 사용자 조회
                    response = self.session.get(f"{{self.base_url}}/users/{{user_id}}")
                    logger.info(f"상태 코드: {{response.status_code}}")
                    
                    if response.status_code == 200:
                        user_data = response.json()
                        logger.info(f"사용자 데이터: {{user_data}}")
                        self.assertEqual(user_data["uid"], user_id, "사용자 ID가 일치하지 않습니다.")
                    else:
                        logger.warning(f"사용자 조회 실패: {{response.text}}")
                else:
                    logger.warning("테스트할 사용자가 없습니다.")
            else:
                logger.warning(f"사용자 목록 가져오기 실패: {{users_response.text}}")
        else:
            logger.warning(f"로그인 실패: {{login_response.text}}")

if __name__ == "__main__":
    import time
    unittest.main()
"""
        return test_code
    
    def _generate_auth_test(self, prompt):
        """인증 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 인증 테스트 코드

import requests
import json
import logging
import unittest
import time

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AuthTest(unittest.TestCase):
    def setUp(self):
        self.base_url = "{self.base_url}"
        self.session = requests.Session()
        # 테스트용 사용자 정보
        self.test_user = {{
            "uemail": f"test_auth_{{int(time.time())}}@example.com",
            "upassword": "testpassword123",
            "urole": "user"
        }}
        logger.info(f"인증 테스트 설정 완료: {{self.base_url}}")
    
    def tearDown(self):
        self.session.close()
        logger.info("인증 테스트 세션 종료")
    
    def test_1_register(self):
        """사용자 등록 테스트"""
        logger.info("사용자 등록 테스트 중...")
        response = self.session.post(f"{{self.base_url}}/users/", json=self.test_user)
        
        logger.info(f"상태 코드: {{response.status_code}}")
        self.assertIn(response.status_code, [200, 201, 400], "예상된 상태 코드가 아닙니다.")
        
        if response.status_code in [200, 201]:
            data = response.json()
            logger.info(f"등록 성공: {{data}}")
            self.assertIn("uid", data, "응답에 사용자 ID가 없습니다.")
        elif response.status_code == 400:
            # 이미 등록된 이메일일 수 있음
            logger.info(f"등록 실패 (이미 존재하는 사용자일 수 있음): {{response.text}}")
    
    def test_2_login(self):
        """로그인 테스트"""
        logger.info("로그인 테스트 중...")
        login_data = {{
            "uemail": self.test_user["uemail"],
            "upassword": self.test_user["upassword"]
        }}
        
        response = self.session.post(f"{{self.base_url}}/auth/login", json=login_data)
        logger.info(f"상태 코드: {{response.status_code}}")
        
        if response.status_code == 200:
            data = response.json()
            logger.info("로그인 성공")
            self.assertIn("token", data, "응답에 토큰이 없습니다.")
            
            # 토큰 저장
            self.token = data["token"]
            self.session.headers.update({{
                "Authorization": f"Bearer {{self.token}}"
            }})
        else:
            logger.warning(f"로그인 실패: {{response.text}}")
            self.skipTest("로그인 실패로 인해 후속 테스트를 건너뜁니다.")
    
    def test_3_get_current_user(self):
        """현재 사용자 정보 조회 테스트"""
        # 먼저 로그인
        self.test_2_login()
        
        logger.info("현재 사용자 정보 조회 테스트 중...")
        response = self.session.get(f"{{self.base_url}}/users/me")
        logger.info(f"상태 코드: {{response.status_code}}")
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"사용자 정보: {{data}}")
            self.assertEqual(data["uemail"], self.test_user["uemail"], "이메일이 일치하지 않습니다.")
        else:
            logger.warning(f"사용자 정보 조회 실패: {{response.text}}")
    
    def test_4_invalid_token(self):
        """잘못된 토큰 테스트"""
        logger.info("잘못된 토큰 테스트 중...")
        
        # 잘못된 토큰 설정
        self.session.headers.update({{
            "Authorization": "Bearer invalid_token_here"
        }})
        
        response = self.session.get(f"{{self.base_url}}/users/me")
        logger.info(f"상태 코드: {{response.status_code}}")
        
        # 인증 실패 확인 (401 예상)
        self.assertEqual(response.status_code, 401, "잘못된 토큰으로 인증되었습니다.")
        logger.info("잘못된 토큰 테스트 성공: 인증 거부됨")

if __name__ == "__main__":
    # 테스트 순서 보장을 위해 명시적으로 테스트 실행
    suite = unittest.TestSuite()
    suite.addTest(AuthTest("test_1_register"))
    suite.addTest(AuthTest("test_2_login"))
    suite.addTest(AuthTest("test_3_get_current_user"))
    suite.addTest(AuthTest("test_4_invalid_token"))
    
    runner = unittest.TextTestRunner()
    runner.run(suite)
"""
        return test_code
    
    def _generate_file_upload_test(self, prompt):
        """파일 업로드 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 파일 업로드 테스트 코드

import requests
import os
import logging
import unittest
import time
import tempfile

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FileUploadTest(unittest.TestCase):
    def setUp(self):
        self.base_url = "{self.base_url}"
        self.session = requests.Session()
        
        # 테스트용 임시 파일 생성
        self.temp_dir = tempfile.mkdtemp()
        
        # 텍스트 파일 생성
        self.text_file_path = os.path.join(self.temp_dir, "test_text.txt")
        with open(self.text_file_path, "w") as f:
            f.write("This is a test text file for upload testing.")
        
        # 이미지 파일 생성 (더미 데이터)
        self.image_file_path = os.path.join(self.temp_dir, "test_image.png")
        with open(self.image_file_path, "wb") as f:
            f.write(b"\x89PNG\r\n\x1a\n" + b"\x00" * 100)  # 간단한 PNG 헤더 + 더미 데이터
        
        logger.info(f"파일 업로드 테스트 설정 완료: {{self.base_url}}")
        logger.info(f"생성된 테스트 파일: {{self.text_file_path}}, {{self.image_file_path}}")
        
        # 로그인 (필요한 경우)
        self._login()
    
    def tearDown(self):
        self.session.close()
        
        # 임시 파일 정리
        if os.path.exists(self.text_file_path):
            os.remove(self.text_file_path)
        if os.path.exists(self.image_file_path):
            os.remove(self.image_file_path)
        os.rmdir(self.temp_dir)
        
        logger.info("파일 업로드 테스트 정리 완료")
    
    def _login(self):
        """테스트를 위한 로그인 (필요한 경우)"""
        try:
            login_data = {{
                "uemail": "test@example.com",
                "upassword": "testpassword"
            }}
            response = self.session.post(f"{{self.base_url}}/auth/login", json=login_data)
            
            if response.status_code == 200:
                token_data = response.json()
                token = token_data.get("token")
                self.session.headers.update({{
                    "Authorization": f"Bearer {{token}}"
                }})
                logger.info("로그인 성공")
            else:
                logger.warning(f"로그인 실패: {{response.text}}")
        except Exception as e:
            logger.error(f"로그인 중 오류 발생: {{e}}")
    
    def test_upload_text_file(self):
        """텍스트 파일 업로드 테스트"""
        logger.info("텍스트 파일 업로드 테스트 중...")
        
        with open(self.text_file_path, "rb") as f:
            files = {{
                "file": (os.path.basename(self.text_file_path), f, "text/plain")
            }}
            response = self.session.post(f"{{self.base_url}}/uploads/", files=files)
        
        logger.info(f"상태 코드: {{response.status_code}}")
        self.assertIn(response.status_code, [200, 201], "파일 업로드 실패")
        
        if response.status_code in [200, 201]:
            data = response.json()
            logger.info(f"업로드 성공: {{data}}")
            self.assertIn("file_path", data, "응답에 파일 경로가 없습니다.")
    
    def test_upload_image_file(self):
        """이미지 파일 업로드 테스트"""
        logger.info("이미지 파일 업로드 테스트 중...")
        
        with open(self.image_file_path, "rb") as f:
            files = {{
                "file": (os.path.basename(self.image_file_path), f, "image/png")
            }}
            response = self.session.post(f"{{self.base_url}}/uploads/", files=files)
        
        logger.info(f"상태 코드: {{response.status_code}}")
        self.assertIn(response.status_code, [200, 201], "파일 업로드 실패")
        
        if response.status_code in [200, 201]:
            data = response.json()
            logger.info(f"업로드 성공: {{data}}")
            self.assertIn("file_path", data, "응답에 파일 경로가 없습니다.")
    
    def test_upload_large_file(self):
        """대용량 파일 업로드 테스트"""
        logger.info("대용량 파일 업로드 테스트 중...")
        
        # 10MB 크기의 임시 파일 생성
        large_file_path = os.path.join(self.temp_dir, "large_test_file.bin")
        with open(large_file_path, "wb") as f:
            f.write(b"0" * (10 * 1024 * 1024))  # 10MB
        
        try:
            with open(large_file_path, "rb") as f:
                files = {{
                    "file": (os.path.basename(large_file_path), f, "application/octet-stream")
                }}
                response = self.session.post(f"{{self.base_url}}/uploads/", files=files)
            
            logger.info(f"상태 코드: {{response.status_code}}")
            # 서버 설정에 따라 대용량 파일 업로드가 허용되지 않을 수 있음
            if response.status_code in [200, 201]:
                data = response.json()
                logger.info(f"대용량 파일 업로드 성공: {{data}}")
                self.assertIn("file_path", data, "응답에 파일 경로가 없습니다.")
            else:
                logger.warning(f"대용량 파일 업로드 실패 (서버 제한일 수 있음): {{response.text}}")
        finally:
            # 임시 파일 정리
            if os.path.exists(large_file_path):
                os.remove(large_file_path)

if __name__ == "__main__":
    unittest.main()
"""
        return test_code
    
    def _generate_database_test(self, prompt):
        """데이터베이스 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 데이터베이스 테스트 코드

import psycopg2
import logging
import unittest
from psycopg2.extras import RealDictCursor
import time
import random
import string

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseTest(unittest.TestCase):
    def setUp(self):
        # 데이터베이스 연결 설정
        self.db_config = {{
            'dbname': 'adcluster',
            'user': 'postgres',
            'password': 'postgres',
            'host': 'localhost',
            'port': '5432'
        }}
        
        # 테스트용 랜덤 데이터 생성
        self.random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        self.test_data = {{
            'uemail': f'test_{{self.random_suffix}}@example.com',
            'upassword': 'hashed_password_for_test',
            'urole': 'user'
        }}
        
        # 데이터베이스 연결
        self.conn = self._connect_to_db()
        logger.info("데이터베이스 테스트 설정 완료")
    
    def tearDown(self):
        # 테스트 데이터 정리
        if hasattr(self, 'test_user_id'):
            self._cleanup_test_data()
        
        # 데이터베이스 연결 종료
        if self.conn:
            self.conn.close()
        
        logger.info("데이터베이스 테스트 정리 완료")
    
    def _connect_to_db(self):
        """데이터베이스에 연결합니다."""
        try:
            conn = psycopg2.connect(**self.db_config)
            return conn
        except Exception as e:
            logger.error(f"데이터베이스 연결 오류: {{e}}")
            self.fail(f"데이터베이스 연결 실패: {{e}}")
    
    def _cleanup_test_data(self):
        """테스트 데이터를 정리합니다."""
        try:
            with self.conn.cursor() as cursor:
                cursor.execute("DELETE FROM users WHERE uid = %s", (self.test_user_id,))
                self.conn.commit()
                logger.info(f"테스트 사용자 삭제 완료: {{self.test_user_id}}")
        except Exception as e:
            logger.error(f"테스트 데이터 정리 중 오류 발생: {{e}}")
            self.conn.rollback()
    
    def test_1_create_user(self):
        """사용자 생성 테스트"""
        logger.info("사용자 생성 테스트 중...")
        
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                INSERT INTO users (uemail, upassword, urole)
                VALUES (%s, %s, %s)
                RETURNING uid
                """, (self.test_data['uemail'], self.test_data['upassword'], self.test_data['urole']))
                
                result = cursor.fetchone()
                self.conn.commit()
                
                self.assertIsNotNone(result, "사용자 생성 실패")
                self.test_user_id = result['uid']
                logger.info(f"사용자 생성 성공: {{self.test_user_id}}")
        except Exception as e:
            logger.error(f"사용자 생성 중 오류 발생: {{e}}")
            self.conn.rollback()
            self.fail(f"사용자 생성 실패: {{e}}")
    
    def test_2_read_user(self):
        """사용자 조회 테스트"""
        # 먼저 사용자 생성
        self.test_1_create_user()
        
        logger.info("사용자 조회 테스트 중...")
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                SELECT * FROM users WHERE uid = %s
                """, (self.test_user_id,))
                
                user = cursor.fetchone()
                
                self.assertIsNotNone(user, "사용자 조회 실패")
                self.assertEqual(user['uemail'], self.test_data['uemail'], "이메일이 일치하지 않습니다.")
                self.assertEqual(user['urole'], self.test_data['urole'], "역할이 일치하지 않습니다.")
                logger.info(f"사용자 조회 성공: {{user}}")
        except Exception as e:
            logger.error(f"사용자 조회 중 오류 발생: {{e}}")
            self.fail(f"사용자 조회 실패: {{e}}")
    
    def test_3_update_user(self):
        """사용자 업데이트 테스트"""
        # 먼저 사용자 생성
        self.test_1_create_user()
        
        logger.info("사용자 업데이트 테스트 중...")
        try:
            # 업데이트할 데이터
            updated_role = 'admin'
            
            with self.conn.cursor() as cursor:
                cursor.execute("""
                UPDATE users SET urole = %s WHERE uid = %s
                """, (updated_role, self.test_user_id))
                self.conn.commit()
                
                # 업데이트 확인
                cursor.execute("""
                SELECT urole FROM users WHERE uid = %s
                """, (self.test_user_id,))
                
                result = cursor.fetchone()
                self.assertEqual(result[0], updated_role, "역할 업데이트가 적용되지 않았습니다.")
                logger.info(f"사용자 업데이트 성공: {{result}}")
        except Exception as e:
            logger.error(f"사용자 업데이트 중 오류 발생: {{e}}")
            self.conn.rollback()
            self.fail(f"사용자 업데이트 실패: {{e}}")
    
    def test_4_delete_user(self):
        """사용자 삭제 테스트"""
        # 먼저 사용자 생성
        self.test_1_create_user()
        
        logger.info("사용자 삭제 테스트 중...")
        try:
            with self.conn.cursor() as cursor:
                cursor.execute("""
                DELETE FROM users WHERE uid = %s
                """, (self.test_user_id,))
                self.conn.commit()
                
                # 삭제 확인
                cursor.execute("""
                SELECT * FROM users WHERE uid = %s
                """, (self.test_user_id,))
                
                result = cursor.fetchone()
                self.assertIsNone(result, "사용자가 삭제되지 않았습니다.")
                logger.info("사용자 삭제 성공")
                
                # tearDown에서 중복 삭제 방지
                delattr(self, 'test_user_id')
        except Exception as e:
            logger.error(f"사용자 삭제 중 오류 발생: {{e}}")
            self.conn.rollback()
            self.fail(f"사용자 삭제 실패: {{e}}")

if __name__ == "__main__":
    # 테스트 순서 보장을 위해 명시적으로 테스트 실행
    suite = unittest.TestSuite()
    suite.addTest(DatabaseTest("test_1_create_user"))
    suite.addTest(DatabaseTest("test_2_read_user"))
    suite.addTest(DatabaseTest("test_3_update_user"))
    suite.addTest(DatabaseTest("test_4_delete_user"))
    
    runner = unittest.TextTestRunner()
    runner.run(suite)
"""
        return test_code
    
    def _generate_workflow_test(self, prompt):
        """워크플로우 테스트 코드를 생성합니다."""
        test_code = f"""
# 프롬프트: {prompt}
# 생성된 워크플로우 테스트 코드

import requests
import websockets
import asyncio
import logging
import json
import time
import unittest

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WorkflowTest(unittest.TestCase):
    def setUp(self):
        self.base_url = "{self.base_url}"
        self.ws_base_url = "{self.ws_base_url}"
        self.session = requests.Session()
        
        # 테스트용 사용자 정보
        self.test_user = {{
            "uemail": f"test_workflow_{{int(time.time())}}@example.com",
            "upassword": "testpassword123",
            "urole": "user"
        }}
        
        # 테스트용 프로젝트 정보
        self.test_project = {{
            "name": f"Test Project {{int(time.time())}}",
            "description": "A test project for workflow testing"
        }}
        
        logger.info("워크플로우 테스트 설정 완료")
    
    def tearDown(self):
        self.session.close()
        logger.info("워크플로우 테스트 세션 종료")
    
    def test_complete_workflow(self):
        """전체 워크플로우 테스트"""
        logger.info("전체 워크플로우 테스트 시작")
        
        # 1. 사용자 등록
        user_id = self._register_user()
        if not user_id:
            self.fail("사용자 등록 실패로 워크플로우 테스트를 중단합니다.")
        
        # 2. 로그인
        token = self._login()
        if not token:
            self.fail("로그인 실패로 워크플로우 테스트를 중단합니다.")
        
        # 3. 프로젝트 생성
        project_id = self._create_project(token)
        if not project_id:
            self.fail("프로젝트 생성 실패로 워크플로우 테스트를 중단합니다.")
        
        # 4. 파일 업로드
        file_path = self._upload_file(token, project_id)
        if not file_path:
            self.fail("파일 업로드 실패로 워크플로우 테스트를 중단합니다.")
        
        # 5. 웹소켓 연결 및 메시지 전송
        asyncio.run(self._test_websocket_communication(token, project_id))
        
        logger.info("전체 워크플로우 테스트 완료")
    
    def _register_user(self):
        """사용자 등록 단계"""
        logger.info("1. 사용자 등록 중...")
        
        try:
            response = self.session.post(f"{{self.base_url}}/users/", json=self.test_user)
            logger.info(f"상태 코드: {{response.status_code}}")
            
            if response.status_code in [200, 201]:
                data = response.json()
                user_id = data.get("uid")
                logger.info(f"사용자 등록 성공: {{user_id}}")
                return user_id
            else:
                logger.warning(f"사용자 등록 실패: {{response.text}}")
                return None
        except Exception as e:
            logger.error(f"사용자 등록 중 오류 발생: {{e}}")
            return None
    
    def _login(self):
        """로그인 단계"""
        logger.info("2. 로그인 중...")
        
        try:
            login_data = {{
                "uemail": self.test_user["uemail"],
                "upassword": self.test_user["upassword"]
            }}
            
            response = self.session.post(f"{{self.base_url}}/auth/login", json=login_data)
            logger.info(f"상태 코드: {{response.status_code}}")
            
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                
                # 세션에 토큰 설정
                self.session.headers.update({{
                    "Authorization": f"Bearer {{token}}"
                }})
                
                logger.info("로그인 성공")
                return token
            else:
                logger.warning(f"로그인 실패: {{response.text}}")
                return None
        except Exception as e:
            logger.error(f"로그인 중 오류 발생: {{e}}")
            return None
    
    def _create_project(self, token):
        """프로젝트 생성 단계"""
        logger.info("3. 프로젝트 생성 중...")
        
        try:
            response = self.session.post(f"{{self.base_url}}/projects/", json=self.test_project)
            logger.info(f"상태 코드: {{response.status_code}}")
            
            if response.status_code in [200, 201]:
                data = response.json()
                project_id = data.get("id")
                logger.info(f"프로젝트 생성 성공: {{project_id}}")
                return project_id
            else:
                logger.warning(f"프로젝트 생성 실패: {{response.text}}")
                return None
        except Exception as e:
            logger.error(f"프로젝트 생성 중 오류 발생: {{e}}")
            return None
    
    def _upload_file(self, token, project_id):
        """파일 업로드 단계"""
        logger.info("4. 파일 업로드 중...")
        
        try:
            # 임시 파일 생성
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as temp:
                temp.write(b"This is a test file for workflow testing.")
                temp_path = temp.name
            
            # 파일 업로드
            with open(temp_path, "rb") as f:
                files = {{
                    "file": (os.path.basename(temp_path), f, "text/plain")
                }}
                data = {{
                    "project_id": project_id
                }}
                
                response = self.session.post(f"{{self.base_url}}/uploads/", files=files, data=data)
                logger.info(f"상태 코드: {{response.status_code}}")
                
                # 임시 파일 삭제
                os.unlink(temp_path)
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    file_path = data.get("file_path")
                    logger.info(f"파일 업로드 성공: {{file_path}}")
                    return file_path
                else:
                    logger.warning(f"파일 업로드 실패: {{response.text}}")
                    return None
        except Exception as e:
            logger.error(f"파일 업로드 중 오류 발생: {{e}}")
            return None
    
    async def _test_websocket_communication(self, token, project_id):
        """웹소켓 통신 테스트 단계"""
        logger.info("5. 웹소켓 통신 테스트 중...")
        
        client_id = f"workflow_test_{{int(time.time())}}"  # 고유한 클라이언트 ID
        uri = f"{{self.ws_base_url}}/ws/{{client_id}}?token={{token}}"
        
        try:
            # 웹소켓 연결
            async with websockets.connect(uri) as websocket:
                logger.info(f"웹소켓 연결 성공: {{uri}}")
                
                # 웰컴 메시지 수신
                welcome = await websocket.recv()
                logger.info(f"웰컴 메시지: {{welcome}}")
                
                # 프로젝트 구독 메시지 전송
                subscribe_msg = json.dumps({{
                    "action": "subscribe",
                    "project_id": project_id
                }})
                await websocket.send(subscribe_msg)
                logger.info(f"구독 메시지 전송: {{subscribe_msg}}")
                
                # 응답 수신 (2초 대기)
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    logger.info(f"구독 응답: {{response}}")
                except asyncio.TimeoutError:
                    logger.warning("구독 응답 수신 시간 초과")
                
                # 테스트 메시지 전송
                test_msg = json.dumps({{
                    "action": "message",
                    "project_id": project_id,
                    "content": "This is a test message from workflow test."
                }})
                await websocket.send(test_msg)
                logger.info(f"테스트 메시지 전송: {{test_msg}}")
                
                # 응답 수신 (2초 대기)
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    logger.info(f"메시지 응답: {{response}}")
                except asyncio.TimeoutError:
                    logger.warning("메시지 응답 수신 시간 초과")
                
                logger.info("웹소켓 통신 테스트 완료")
        except Exception as e:
            logger.error(f"웹소켓 통신 테스트 중 오류 발생: {{e}}")
            raise

if __name__ == "__main__":
    unittest.main()
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
import logging
import json
import unittest
import time
import os

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GenericTest(unittest.TestCase):
    def setUp(self):
        self.base_url = "{self.base_url}"
        self.ws_base_url = "{self.ws_base_url}"
        self.session = requests.Session()
        logger.info("일반 테스트 설정 완료")
    
    def tearDown(self):
        self.session.close()
        logger.info("일반 테스트 세션 종료")
    
    def test_server_status(self):
        """서버 상태 테스트"""
        logger.info("서버 상태 테스트 중...")
        
        try:
            response = self.session.get(f"{{self.base_url}}/")
            logger.info(f"상태 코드: {{response.status_code}}")
            self.assertEqual(response.status_code, 200, "서버가 응답하지 않습니다.")
            logger.info("서버 상태 테스트 성공")
        except requests.RequestException as e:
            logger.error(f"서버 상태 테스트 중 오류 발생: {{e}}")
            self.fail(f"서버 연결 실패: {{e}}")
    
    def test_api_endpoints(self):
        """API 엔드포인트 테스트"""
        logger.info("API 엔드포인트 테스트 중...")
        
        # 테스트할 엔드포인트 목록
        endpoints = [
            "/users/",
            "/auth/login",
            "/ws/clients"
        ]
        
        for endpoint in endpoints:
            try:
                response = self.session.get(f"{{self.base_url}}{{endpoint}}")
                logger.info(f"엔드포인트 {{endpoint}} 상태 코드: {{response.status_code}}")
                
                # 상태 코드가 401(인증 필요)이어도 엔드포인트가 존재하는 것으로 간주
                self.assertIn(response.status_code, [200, 401, 403, 404], f"엔드포인트 {{endpoint}}가 예상치 못한 상태 코드를 반환했습니다.")
            except requests.RequestException as e:
                logger.error(f"엔드포인트 {{endpoint}} 테스트 중 오류 발생: {{e}}")
        
        logger.info("API 엔드포인트 테스트 완료")
    
    async def test_websocket_connection(self):
        """웹소켓 연결 테스트"""
        logger.info("웹소켓 연결 테스트 중...")
        
        client_id = f"test_{{int(time.time())}}"  # 고유한 클라이언트 ID
        uri = f"{{self.ws_base_url}}/ws/{{client_id}}"
        
        try:
            async with websockets.connect(uri) as websocket:
                logger.info("웹소켓 서버에 연결되었습니다.")
                
                # 웰컴 메시지 수신
                welcome = await websocket.recv()
                logger.info(f"웰컴 메시지: {{welcome}}")
                
                # 테스트 메시지 전송
                test_message = "테스트 메시지입니다."
                await websocket.send(test_message)
                logger.info(f"전송: {{test_message}}")
                
                # 응답 수신 (2초 대기)
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    logger.info(f"수신: {{response}}")
                except asyncio.TimeoutError:
                    logger.warning("응답 수신 시간 초과")
                
                logger.info("웹소켓 연결 테스트 완료")
                return True
        except Exception as e:
            logger.error(f"웹소켓 연결 테스트 중 오류 발생: {{e}}")
            return False
    
    def test_run_websocket(self):
        """웹소켓 테스트 실행 (비동기 테스트 래퍼)"""
        result = asyncio.run(self.test_websocket_connection())
        self.assertTrue(result, "웹소켓 연결 테스트 실패")

if __name__ == "__main__":
    unittest.main()
"""
        return test_code
    
    async def generate_test_from_prompt(self, prompt):
        """프롬프트를 기반으로 테스트 코드를 생성합니다."""
        # 프롬프트 분석
        test_type = self.analyze_prompt_with_context7(prompt)
        logger.info(f"프롬프트 분석 결과: {test_type}")
        
        # 테스트 코드 생성
        test_code = self.generate_test_code(prompt, test_type)
        
        # 데이터베이스에 저장
        test_id = self.save_test_to_db(prompt, test_code, test_type)
        
        # GitHub에 저장 (실제 구현 시 추가)
        # self.save_to_github(prompt, test_code, test_type)
        
        return {
            "test_id": test_id,
            "test_code": test_code,
            "test_type": test_type
        }

# 메인 실행 함수
def generate_test_from_prompt(prompt):
    """프롬프트를 기반으로 테스트 코드를 생성하는 메인 함수"""
    generator = Context7TestGenerator()
    test_type = generator.analyze_prompt_with_context7(prompt)
    test_code = generator.generate_test_code(prompt, test_type)
    
    # 결과 출력
    print(f"\n프롬프트: {prompt}")
    print(f"분석된 테스트 유형: {test_type}")
    print("\n생성된 테스트 코드:")
    print("=" * 80)
    print(test_code)
    print("=" * 80)
    
    # 데이터베이스에 저장 시도
    try:
        test_id = generator.save_test_to_db(prompt, test_code, test_type)
        if test_id:
            print(f"\n테스트 코드가 데이터베이스에 저장되었습니다. ID: {test_id}")
    except Exception as e:
        print(f"\n데이터베이스 저장 중 오류 발생: {e}")
    
    return test_code

# 명령줄에서 실행 시
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # 명령줄 인수로 프롬프트 받기
        prompt = " ".join(sys.argv[1:])
    else:
        # 인수가 없으면 사용자 입력 받기
        prompt = input("테스트 코드를 생성할 프롬프트를 입력하세요: ")
    
    generate_test_from_prompt(prompt)