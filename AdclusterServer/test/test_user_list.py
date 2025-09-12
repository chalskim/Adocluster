import requests
import json
import time

# 서버 기본 URL
BASE_URL = "http://localhost:8000"

def test_login():
    """로그인 테스트 및 토큰 획득"""
    print("로그인 테스트 중...")
    
    # 로그인 데이터
    login_data = {
        "uemail": "admin@example.com",  # 실제 존재하는 관리자 계정으로 변경 필요
        "upassword": "adminpassword"     # 실제 비밀번호로 변경 필요
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            headers={"Content-Type": "application/json"},
            data=json.dumps(login_data)
        )
        
        print(f"로그인 상태 코드: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"로그인 성공! 토큰: {result['access_token'][:20]}...")
            return result["access_token"]
        else:
            print(f"로그인 실패: {response.text}")
            return None
            
    except Exception as e:
        print(f"로그인 중 오류 발생: {e}")
        return None

def test_get_user_list(token):
    """사용자 목록 가져오기 테스트"""
    print("\n사용자 목록 가져오기 테스트 중...")
    
    try:
        # 전체 권한으로 사용자 목록 요청
        response = requests.get(
            f"{BASE_URL}/users/?full_permission=1",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print(f"사용자 목록 상태 코드: {response.status_code}")
        if response.status_code == 200:
            users = response.json()
            print(f"총 사용자 수: {len(users)}")
            
            # 처음 5명의 사용자만 출력 (사용자가 많을 경우)
            for i, user in enumerate(users[:5]):
                print(f"\n사용자 {i+1}:")
                print(f"  ID: {user.get('uid')}")
                print(f"  이메일: {user.get('uemail')}")
                print(f"  역할: {user.get('urole')}")
                print(f"  생성일: {user.get('ucreate_at')}")
            
            if len(users) > 5:
                print(f"\n... 외 {len(users) - 5}명의 사용자가 있습니다.")
                
            return users
        else:
            print(f"사용자 목록 가져오기 실패: {response.text}")
            return None
            
    except Exception as e:
        print(f"사용자 목록 가져오기 중 오류 발생: {e}")
        return None

def test_get_user_list_without_permission(token):
    """권한 없이 사용자 목록 가져오기 테스트"""
    print("\n권한 없이 사용자 목록 가져오기 테스트 중...")
    
    try:
        # 기본 권한으로 사용자 목록 요청 (full_permission 파라미터 없음)
        response = requests.get(
            f"{BASE_URL}/users/",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print(f"사용자 목록 상태 코드: {response.status_code}")
        if response.status_code == 200:
            users = response.json()
            print(f"총 사용자 수: {len(users)}")
            
            # 처음 5명의 사용자만 출력 (사용자가 많을 경우)
            for i, user in enumerate(users[:5]):
                print(f"\n사용자 {i+1}:")
                print(f"  ID: {user.get('uid')}")
                print(f"  이메일: {user.get('uemail')}")
                print(f"  역할: {user.get('urole')}")
                print(f"  생성일: {user.get('ucreate_at')}")
            
            if len(users) > 5:
                print(f"\n... 외 {len(users) - 5}명의 사용자가 있습니다.")
                
            return users
        else:
            print(f"사용자 목록 가져오기 실패: {response.text}")
            return None
            
    except Exception as e:
        print(f"사용자 목록 가져오기 중 오류 발생: {e}")
        return None

if __name__ == "__main__":
    print("사용자 목록 API 테스트 시작...\n")
    
    # 로그인하여 토큰 획득
    token = test_login()
    
    if token:
        # 전체 권한으로 사용자 목록 가져오기
        full_permission_users = test_get_user_list(token)
        
        # 기본 권한으로 사용자 목록 가져오기
        limited_users = test_get_user_list_without_permission(token)
        
        # 두 결과 비교
        if full_permission_users and limited_users:
            if len(full_permission_users) > len(limited_users):
                print(f"\n전체 권한 사용자 목록({len(full_permission_users)}명)이 기본 권한 사용자 목록({len(limited_users)}명)보다 많습니다.")
            elif len(full_permission_users) < len(limited_users):
                print(f"\n기본 권한 사용자 목록({len(limited_users)}명)이 전체 권한 사용자 목록({len(full_permission_users)}명)보다 많습니다.")
            else:
                print(f"\n전체 권한과 기본 권한 사용자 목록의 수가 동일합니다({len(full_permission_users)}명).")
    
    print("\n사용자 목록 API 테스트 완료.")