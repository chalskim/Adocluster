#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
예제 사용법 - 테스트 코드 생성 시스템

이 스크립트는 Context7을 사용하여 자연어 명령을 해석하고 테스트 코드를 생성하는 시스템의 사용 예제를 제공합니다.
"""

import os
import sys
import logging
from typing import Dict, Any

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 모듈 임포트
from main_integration import TestCodeGenerationSystem

def run_examples():
    """예제 실행"""
    # 시스템 인스턴스 생성
    system = TestCodeGenerationSystem()
    
    # 예제 1: 테스트 코드 생성
    print("\n===== 예제 1: 테스트 코드 생성 =====\n")
    prompt = "웹소켓 연결을 테스트하는 코드를 생성해주세요. 클라이언트가 연결하고 메시지를 보내고 받는 기능을 테스트해야 합니다."
    result = system.process_prompt(prompt)
    print_result(result)
    
    # 예제 2: 워크플로우 생성
    print("\n===== 예제 2: 워크플로우 생성 =====\n")
    prompt = "파일 업로드 테스트를 위한 워크플로우를 생성해주세요. 파일을 업로드하고 서버 응답을 확인하는 단계가 포함되어야 합니다."
    result = system.process_prompt(prompt)
    print_result(result)
    
    # 예제 3: 워크플로우 실행
    print("\n===== 예제 3: 워크플로우 실행 =====\n")
    if result.get('status') == 'success' and 'workflow_id' in result:
        workflow_id = result['workflow_id']
        execution_result = system.workflow_manager.execute_workflow(workflow_id=workflow_id)
        execution = system.workflow_manager.get_workflow_execution(execution_result)
        print(f"워크플로우 실행 결과: {execution}")
    else:
        print("워크플로우 ID를 찾을 수 없어 실행을 건너뜁니다.")
    
    # 예제 4: 사용자 템플릿 생성
    print("\n===== 예제 4: 사용자 템플릿 생성 =====\n")
    template_name = "기본 웹소켓 테스트"
    template_description = "웹소켓 연결 및 메시지 교환을 테스트하는 기본 템플릿"
    template_content = """
# 웹소켓 테스트 템플릿
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        # 연결 확인
        print("웹소켓 서버에 연결되었습니다.")
        
        # 메시지 전송
        await websocket.send(json.dumps({"type": "message", "content": "테스트 메시지"}))
        print("메시지를 전송했습니다.")
        
        # 응답 수신
        response = await websocket.recv()
        print(f"응답을 수신했습니다: {response}")
        
        return json.loads(response)

# 메인 실행
asyncio.run(test_websocket())
"""
    
    result = system.create_user_template(template_name, template_description, template_content)
    print_result(result)
    
    # 예제 5: GitHub에 테스트 코드 저장
    print("\n===== 예제 5: GitHub에 테스트 코드 저장 =====\n")
    prompt = "API 엔드포인트 /users를 테스트하는 코드를 생성해주세요. 사용자 목록을 가져오고 특정 사용자 정보를 조회하는 기능을 테스트해야 합니다."
    result = system.process_prompt(prompt)
    print_result(result)
    
    # 예제 6: 조건부 로직이 있는 워크플로우 생성
    print("\n===== 예제 6: 조건부 로직이 있는 워크플로우 생성 =====\n")
    prompt = "인증 테스트를 위한 워크플로우를 생성해주세요. 로그인 성공 시 사용자 정보를 확인하고, 실패 시 오류 메시지를 확인하는 조건부 로직이 포함되어야 합니다."
    result = system.process_prompt(prompt)
    print_result(result)

def print_result(result: Dict[str, Any]):
    """결과 출력
    
    Args:
        result (dict): 처리 결과
    """
    if not result:
        print("결과가 없습니다.")
        return
    
    print(f"상태: {result.get('status', 'N/A')}")
    print(f"메시지: {result.get('message', 'N/A')}")
    
    # 테스트 코드 결과
    if 'test_code' in result:
        print("\n테스트 코드 미리보기:")
        print(f"{result['test_code']}..." if len(result['test_code']) > 100 else result['test_code'])
    
    # 워크플로우 결과
    if 'workflow_id' in result:
        print(f"\n워크플로우 ID: {result['workflow_id']}")
        print(f"워크플로우 이름: {result.get('workflow_name', 'N/A')}")
        print(f"단계 수: {result.get('steps_count', 'N/A')}")
    
    # 템플릿 결과
    if 'template_id' in result:
        print(f"\n템플릿 ID: {result['template_id']}")
        print(f"템플릿 이름: {result.get('template_name', 'N/A')}")
    
    # GitHub 결과
    if 'github_result' in result and result['github_result']:
        github_result = result['github_result']
        if 'error' in github_result:
            print(f"\nGitHub 저장 실패: {github_result['error']}")
        else:
            print(f"\nGitHub 저장 완료: {github_result.get('file_path', 'N/A')}")
    
    # PR 결과
    if 'pr_result' in result and result['pr_result']:
        pr_result = result['pr_result']
        if 'error' in pr_result:
            print(f"\nPR 생성 실패: {pr_result['error']}")
        else:
            print(f"\nPR 생성 완료: {pr_result.get('html_url', 'N/A')}")

if __name__ == "__main__":
    try:
        run_examples()
    except Exception as e:
        logger.error(f"예제 실행 중 오류 발생: {e}", exc_info=True)
        sys.exit(1)