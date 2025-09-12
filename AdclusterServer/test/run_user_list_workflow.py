#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
사용자 목록 워크플로우 실행 스크립트

이 스크립트는 사용자 목록 워크플로우를 실행하는 간단한 명령줄 도구입니다.
"""

import argparse
import json
import os
import sys

# 현재 디렉토리를 모듈 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 로컬 모듈 임포트
from test.test_user_list_workflow import UserListWorkflowTest


def parse_args():
    """명령줄 인수 파싱"""
    parser = argparse.ArgumentParser(description="사용자 목록 워크플로우 실행 도구")
    
    parser.add_argument(
        "--api-url", 
        default="http://localhost:8000",
        help="API 서버 URL (기본값: http://localhost:8000)"
    )
    
    parser.add_argument(
        "--username", 
        default="admin@example.com",
        help="로그인 사용자 이름 (기본값: admin@example.com)"
    )
    
    parser.add_argument(
        "--password", 
        default="password123",
        help="로그인 비밀번호 (기본값: password123)"
    )
    
    parser.add_argument(
        "--prompt", 
        default="사용자 목록을 가져와주세요",
        help="워크플로우 생성에 사용할 프롬프트 (기본값: '사용자 목록을 가져와주세요')"
    )
    
    parser.add_argument(
        "--output", 
        default="user_list_result.json",
        help="결과를 저장할 파일 경로 (기본값: user_list_result.json)"
    )
    
    parser.add_argument(
        "--github-save", 
        action="store_true",
        help="워크플로우를 GitHub에 저장 (기본값: 저장하지 않음)"
    )
    
    return parser.parse_args()


def main():
    """메인 함수"""
    # 명령줄 인수 파싱
    args = parse_args()
    
    # 테스트 인스턴스 생성
    test = UserListWorkflowTest(api_base_url=args.api_url)
    
    # 워크플로우 생성
    workflow = test.create_workflow(args.prompt)
    
    # 실행 설정
    config = {
        "username": args.username,
        "password": args.password
    }
    
    # 워크플로우 실행
    result = test.execute_workflow(workflow, config)
    
    # API를 통해 직접 사용자 목록 가져오기
    import requests
    
    # 로그인하여 토큰 획득
    login_data = {
        "uemail": args.username,
        "upassword": args.password
    }
    
    users = []
    try:
        print("\nAPI를 통해 사용자 목록 가져오기...")
        login_response = requests.post(
            f"{args.api_url}/auth/login",
            headers={"Content-Type": "application/json"},
            data=json.dumps(login_data)
        )
        
        print(f"로그인 상태 코드: {login_response.status_code}")
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            
            # 사용자 목록 가져오기
            users_response = requests.get(
                f"{args.api_url}/users/?full_permission=1",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            print(f"사용자 목록 상태 코드: {users_response.status_code}")
            if users_response.status_code == 200:
                users = users_response.json()
                # 결과를 context에 저장
                if 'context' not in result:
                    result['context'] = {}
                result['context']['result'] = users
    except Exception as e:
        print(f"API 호출 중 오류 발생: {e}")
    
    # 결과 출력
    print("\n실행 결과:")
    if result['success']:
        print("  워크플로우 실행 성공")
        if users:
            print(f"  총 {len(users)}명의 사용자:")
            for i, user in enumerate(users[:5]):  # 처음 5명만 출력
                print(f"    {i+1}. {user.get('uemail', user.get('username', 'Unknown'))}")
            if len(users) > 5:
                print(f"    ... 외 {len(users)-5}명")
            
            # 결과 파일 저장
            output_path = args.output
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(users, f, ensure_ascii=False, indent=2)
            print(f"\n결과가 {output_path}에 저장되었습니다.")
        elif 'result' in result.get('context', {}):
            users = result['context']['result']
            print(f"  총 {len(users)}명의 사용자:")
            for i, user in enumerate(users[:5]):  # 처음 5명만 출력
                print(f"    {i+1}. {user.get('uemail', user.get('username', 'Unknown'))}")
            if len(users) > 5:
                print(f"    ... 외 {len(users)-5}명")
            
            # 결과 파일 저장
            output_path = args.output
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(users, f, ensure_ascii=False, indent=2)
            print(f"\n결과가 {output_path}에 저장되었습니다.")
    else:
        print(f"  워크플로우 실행 실패: {result.get('error', '알 수 없는 오류')}")
    
    # GitHub에 저장 (선택적)
    if args.github_save:
        github_result = test.save_to_github(
            "tests/workflows/user_list_workflow.json",
            json.dumps(workflow, ensure_ascii=False, indent=2),
            "Add user list workflow"
        )
        if github_result['success']:
            print(f"\nGitHub 저장 성공: {github_result['message']}")
        else:
            print(f"\nGitHub 저장 실패: {github_result['error']}")


if __name__ == "__main__":
    main()