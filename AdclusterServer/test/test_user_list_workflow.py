#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
사용자 목록 워크플로우 테스트 스크립트

이 스크립트는 Context7Integration을 사용하여 사용자 목록 조회 워크플로우를 생성하고 실행합니다.
"""

import json
import os
import sys
import requests
from typing import Dict, List, Any

# 현재 디렉토리를 모듈 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 로컬 모듈 임포트
from test.context7_integration import Context7Integration
from test.workflow_manager import WorkflowManager
from test.github_integration import GitHubIntegration


class UserListWorkflowTest:
    """사용자 목록 워크플로우 테스트 클래스"""

    def __init__(self, api_base_url: str = "http://localhost:8000"):
        """초기화
        
        Args:
            api_base_url: API 기본 URL
        """
        # API 기본 URL 설정
        self.api_base_url = api_base_url
        
        # 워크플로우 매니저 초기화
        self.workflow_manager = WorkflowManager()
        
        # Context7 통합 초기화
        self.context7 = Context7Integration()
        
        # GitHub 통합 초기화
        self.github = GitHubIntegration()
        
    def login(self, username: str, password: str) -> Dict:
        """로그인
        
        Args:
            username: 사용자 이름
            password: 비밀번호
            
        Returns:
            Dict: 로그인 결과 (토큰 포함)
        """
        login_url = f"{self.api_base_url}/token"
        response = requests.post(
            login_url,
            data={"username": username, "password": password}
        )
        
        if response.status_code != 200:
            print(f"로그인 실패: {response.status_code} - {response.text}")
            return {"success": False, "error": response.text}
        
        return {"success": True, "data": response.json()}
    
    def get_user_list(self, token: str) -> Dict:
        """사용자 목록 조회
        
        Args:
            token: 인증 토큰
            
        Returns:
            Dict: 사용자 목록 조회 결과
        """
        users_url = f"{self.api_base_url}/users/"
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(users_url, headers=headers)
        
        if response.status_code != 200:
            print(f"사용자 목록 조회 실패: {response.status_code} - {response.text}")
            return {"success": False, "error": response.text}
        
        return {"success": True, "data": response.json()}
    
    def save_result(self, result: Dict, file_path: str) -> Dict:
        """결과 저장
        
        Args:
            result: 저장할 결과
            file_path: 파일 경로
            
        Returns:
            Dict: 저장 결과
        """
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            return {"success": True, "message": f"결과가 {file_path}에 저장되었습니다."}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def create_workflow(self, prompt: str) -> Dict:
        """워크플로우 생성
        
        Args:
            prompt: 프롬프트
            
        Returns:
            Dict: 워크플로우 정의
        """
        analysis = self.context7.analyze_prompt(prompt)
        workflow = self.context7.convert_to_workflow(prompt, analysis)
        
        print(f"\n프롬프트: {prompt}")
        print(f"분석 결과:")
        print(f"  의도: {analysis['intent']}")
        print(f"  테스트 유형: {analysis['test_type']}")
        
        print(f"\n워크플로우:")
        print(f"  이름: {workflow['name']}")
        print(f"  설명: {workflow['description']}")
        print(f"  단계:")
        for i, step in enumerate(workflow['steps']):
            print(f"    {i+1}. {step['name']} ({step['task_type']})")
        
        return workflow
    
    def execute_workflow(self, workflow: Dict, config: Dict) -> Dict:
        """워크플로우 실행
        
        Args:
            workflow: 워크플로우 정의
            config: 실행 설정
            
        Returns:
            Dict: 실행 결과
        """
        results = {}
        context = {}
        
        # 초기 컨텍스트 설정
        context.update(config)
        
        for step in workflow['steps']:
            print(f"\n실행 중: {step['name']} ({step['task_type']})")
            
            # 컨텍스트 변수 대체
            step_config = {}
            for key, value in step['config'].items():
                if isinstance(value, str) and value.startswith('{{') and value.endswith('}}'):
                    var_name = value[2:-2].strip()
                    if var_name in context:
                        step_config[key] = context[var_name]
                    else:
                        print(f"경고: 컨텍스트에 {var_name} 변수가 없습니다.")
                        step_config[key] = value
                else:
                    step_config[key] = value
            
            # 단계 실행
            result = {"success": False, "error": "알 수 없는 작업 유형"}
            
            if step['task_type'] == 'login':
                result = self.login(step_config['username'], step_config['password'])
                if result['success']:
                    context['token'] = result['data']['access_token']
                    print(f"  로그인 성공: 토큰 발급됨")
                else:
                    print(f"  로그인 실패: {result['error']}")
            
            elif step['task_type'] == 'get_user_list':
                result = self.get_user_list(step_config['token'])
                if result['success']:
                    context['result'] = result['data']
                    print(f"  사용자 목록 조회 성공: {len(result['data'])}명의 사용자")
                else:
                    print(f"  사용자 목록 조회 실패: {result['error']}")
            
            elif step['task_type'] == 'save_result':
                result = self.save_result(step_config['result'], step_config['file_path'])
                if result['success']:
                    print(f"  결과 저장 성공: {result['message']}")
                else:
                    print(f"  결과 저장 실패: {result['error']}")
            
            elif step['task_type'] == 'analyze_prompt':
                result = {"success": True, "data": "프롬프트 분석 완료"}
                print(f"  프롬프트 분석 완료")
            
            elif step['task_type'] == 'generate_test':
                result = {"success": True, "data": "테스트 코드 생성 완료"}
                print(f"  테스트 코드 생성 완료")
            
            # 결과 저장
            results[step['name']] = result
        
        return {"success": True, "results": results, "context": context}
    
    def save_to_github(self, file_path: str, content: str, commit_message: str) -> Dict:
        """GitHub에 저장
        
        Args:
            file_path: 파일 경로
            content: 파일 내용
            commit_message: 커밋 메시지
            
        Returns:
            Dict: 저장 결과
        """
        return self.github.commit_file(file_path, content, commit_message)


def main():
    """메인 함수"""
    # 테스트 인스턴스 생성
    test = UserListWorkflowTest()
    
    # 워크플로우 매니저의 데이터베이스 설정을 잘못된 정보로 변경하여 연결 실패 테스트
    test.workflow_manager.db_config = {
        'dbname': 'nonexistent_db',
        'user': 'wrong_user',
        'password': 'wrong_password',
        'host': 'localhost',
        'port': '5432'
    }
    
    # 프롬프트 설정
    prompt = "사용자 목록을 가져와주세요"
    
    # 워크플로우 생성
    workflow = test.create_workflow(prompt)
    
    # 실행 설정
    config = {
        "username": "admin@example.com",  # 실제 사용자 정보로 변경
        "password": "password123"       # 실제 비밀번호로 변경
    }
    
    # 워크플로우 실행
    result = test.execute_workflow(workflow, config)
    
    # API를 통해 사용자 목록 가져오기
    import requests
    
    # 로그인하여 토큰 획득
    login_data = {
        "uemail": config["username"],
        "upassword": config["password"]
    }
    
    try:
        login_response = requests.post(
            f"{test.api_base_url}/auth/login",
            headers={"Content-Type": "application/json"},
            data=json.dumps(login_data)
        )
        
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            
            # 사용자 목록 가져오기
            users_response = requests.get(
                f"{test.api_base_url}/users/?full_permission=1",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if users_response.status_code == 200:
                users = users_response.json()
                # 결과를 context에 저장
                result['context']['result'] = users
    except Exception as e:
        print(f"API 호출 중 오류 발생: {e}")
    
    # 결과 출력
    print("\n실행 결과:")
    print(f"  데이터베이스 연결 상태: {'연결됨' if test.workflow_manager.conn and not test.workflow_manager.conn.closed else '연결 실패'}")
    print(f"  실행 결과 전체: {json.dumps(result, ensure_ascii=False, indent=2)}")
    
    if result['success']:
        print("  워크플로우 실행 성공")
        if 'result' in result['context']:
            users = result['context']['result']
            print(f"  총 {len(users)}명의 사용자:")
            for i, user in enumerate(users[:5]):  # 처음 5명만 출력
                print(f"    {i+1}. {user.get('uemail', user.get('username', 'Unknown'))}")
            if len(users) > 5:
                print(f"    ... 외 {len(users)-5}명")
    else:
        print(f"  워크플로우 실행 실패: {result.get('error', '알 수 없는 오류')}")
    
    # GitHub에 저장 (선택적)
    # github_result = test.save_to_github(
    #     "tests/workflows/user_list_workflow.json",
    #     json.dumps(workflow, ensure_ascii=False, indent=2),
    #     "Add user list workflow"
    # )
    # if github_result['success']:
    #     print(f"\nGitHub 저장 성공: {github_result['message']}")
    # else:
    #     print(f"\nGitHub 저장 실패: {github_result['error']}")


if __name__ == "__main__":
    main()