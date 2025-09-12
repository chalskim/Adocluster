import os
import json
import logging
from typing import Dict, List, Any, Optional, Union

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Context7Integration:
    """Context7 통합 클래스
    
    자연어 명령을 해석하고 워크플로우로 변환하는 기능을 제공합니다.
    """
    
    def __init__(self, api_key=None):
        """초기화
        
        Args:
            api_key (str, optional): Context7 API 키
        """
        self.api_key = api_key or os.environ.get('CONTEXT7_API_KEY')
        if not self.api_key:
            logger.warning("Context7 API 키가 설정되지 않았습니다. 환경 변수 CONTEXT7_API_KEY를 설정하거나 초기화 시 제공하세요.")
        
        # 지원하는 테스트 유형
        self.supported_test_types = [
            "websocket",
            "api",
            "auth",
            "file",
            "database",
            "workflow",
            "user_list"  # 사용자 목록 테스트 유형 추가
        ]
    
    def analyze_prompt(self, prompt: str) -> Dict:
        """프롬프트 분석
        
        자연어 프롬프트를 분석하여 의도와 엔티티를 추출합니다.
        
        Args:
            prompt: 분석할 프롬프트
            
        Returns:
            Dict: 분석 결과
        """
        try:
            # 실제 구현에서는 Context7 API 호출
            # 현재는 모의 구현
            logger.info(f"프롬프트 분석: {prompt}")
            
            # 사용자 목록 관련 키워드 감지
            test_type = self._detect_test_type(prompt)
            if any(keyword in prompt.lower() for keyword in ["사용자 목록", "유저 목록", "user list", "users"]):
                test_type = "user_list"
            
            # 간단한 키워드 기반 분석
            result = {
                "intent": self._detect_intent(prompt),
                "entities": self._extract_entities(prompt),
                "test_type": test_type
            }
            
            return result
        except Exception as e:
            logger.error(f"프롬프트 분석 오류: {e}")
            return {
                "intent": "unknown",
                "entities": [],
                "test_type": "generic"
            }
    
    def _detect_intent(self, prompt: str) -> str:
        """의도 감지
        
        Args:
            prompt: 프롬프트
            
        Returns:
            str: 감지된 의도
        """
        prompt_lower = prompt.lower()
        
        if any(keyword in prompt_lower for keyword in ['생성', '만들', '작성', 'create', 'generate', 'write']):
            return "create"
        elif any(keyword in prompt_lower for keyword in ['실행', '테스트', 'run', 'test', 'execute']):
            return "execute"
        elif any(keyword in prompt_lower for keyword in ['수정', '변경', '업데이트', 'update', 'modify', 'change']):
            return "update"
        elif any(keyword in prompt_lower for keyword in ['삭제', '제거', 'delete', 'remove']):
            return "delete"
        else:
            return "unknown"
    
    def _extract_entities(self, prompt: str) -> List[Dict]:
        """엔티티 추출
        
        Args:
            prompt: 프롬프트
            
        Returns:
            List[Dict]: 추출된 엔티티 목록
        """
        entities = []
        prompt_lower = prompt.lower()
        
        # 테스트 유형 엔티티
        test_types = [
            {"name": "websocket", "keywords": ["웹소켓", "websocket", "socket", "ws"]},
            {"name": "api", "keywords": ["api", "엔드포인트", "endpoint", "http", "rest"]},
            {"name": "auth", "keywords": ["인증", "로그인", "auth", "login", "authentication"]},
            {"name": "file", "keywords": ["파일", "업로드", "다운로드", "file", "upload", "download"]},
            {"name": "database", "keywords": ["데이터베이스", "db", "database", "sql", "쿼리", "query"]},
            {"name": "workflow", "keywords": ["워크플로우", "workflow", "프로세스", "process", "순서", "sequence"]}
        ]
        
        for test_type in test_types:
            if any(keyword in prompt_lower for keyword in test_type["keywords"]):
                entities.append({
                    "type": "test_type",
                    "value": test_type["name"]
                })
        
        return entities
    
    def _detect_test_type(self, prompt: str) -> str:
        """테스트 유형 감지
        
        Args:
            prompt: 프롬프트
            
        Returns:
            str: 감지된 테스트 유형
        """
        prompt_lower = prompt.lower()
        
        if any(keyword in prompt_lower for keyword in ["웹소켓", "websocket", "socket", "ws"]):
            return "websocket"
        elif any(keyword in prompt_lower for keyword in ["api", "엔드포인트", "endpoint", "http", "rest"]):
            return "api"
        elif any(keyword in prompt_lower for keyword in ["인증", "로그인", "auth", "login", "authentication"]):
            return "auth"
        elif any(keyword in prompt_lower for keyword in ["파일", "업로드", "다운로드", "file", "upload", "download"]):
            return "file"
        elif any(keyword in prompt_lower for keyword in ["데이터베이스", "db", "database", "sql", "쿼리", "query"]):
            return "database"
        elif any(keyword in prompt_lower for keyword in ["워크플로우", "workflow", "프로세스", "process", "순서", "sequence"]):
            return "workflow"
        else:
            return "generic"
    
    def convert_to_workflow(self, prompt: str, analysis: Dict = None) -> Dict:
        """워크플로우 변환
        
        자연어 프롬프트를 워크플로우 정의로 변환합니다.
        
        Args:
            prompt: 프롬프트
            analysis: 프롬프트 분석 결과 (없으면 자동 분석)
            
        Returns:
            Dict: 워크플로우 정의
        """
        try:
            # 분석 결과가 없으면 자동 분석
            if not analysis:
                analysis = self.analyze_prompt(prompt)
            
            intent = analysis.get("intent", "unknown")
            test_type = analysis.get("test_type", "generic")
            
            # 의도별 워크플로우 생성
            if intent == "create":
                return self._create_test_workflow(prompt, test_type)
            elif intent == "execute":
                if test_type == "user_list":
                    return self._user_list_workflow(prompt)
                return self._execute_test_workflow(prompt, test_type)
            elif intent == "update":
                return self._update_test_workflow(prompt, test_type)
            else:
                return self._generic_workflow(prompt, test_type)
        except Exception as e:
            logger.error(f"워크플로우 변환 오류: {e}")
            return self._generic_workflow(prompt, "generic")
    
    def _create_test_workflow(self, prompt: str, test_type: str) -> Dict:
        """테스트 생성 워크플로우
        
        Args:
            prompt: 프롬프트
            test_type: 테스트 유형
            
        Returns:
            Dict: 워크플로우 정의
        """
        return {
            "name": f"{test_type.capitalize()} 테스트 생성 워크플로우",
            "description": f"프롬프트를 기반으로 {test_type} 테스트 코드를 생성하는 워크플로우",
            "steps": [
                {
                    "name": "프롬프트 분석",
                    "type": "task",
                    "task_type": "analyze_prompt",
                    "config": {
                        "prompt": prompt
                    }
                },
                {
                    "name": "테스트 코드 생성",
                    "type": "task",
                    "task_type": "generate_test",
                    "config": {
                        "test_type": test_type,
                        "prompt": prompt
                    }
                },
                {
                    "name": "GitHub 저장",
                    "type": "task",
                    "task_type": "github_action",
                    "config": {
                        "action": "commit",
                        "file_path": f"tests/generated/{test_type}_test.py",
                        "commit_message": f"Add {test_type} test from prompt"
                    }
                }
            ]
        }
    
    def _execute_test_workflow(self, prompt: str, test_type: str) -> Dict:
        """테스트 실행 워크플로우
        
        Args:
            prompt: 프롬프트
            test_type: 테스트 유형
            
        Returns:
            Dict: 워크플로우 정의
        """
        return {
            "name": f"{test_type.capitalize()} 테스트 실행 워크플로우",
            "description": f"{test_type} 테스트를 실행하는 워크플로우",
            "steps": [
                {
                    "name": "테스트 찾기",
                    "type": "task",
                    "task_type": "find_test",
                    "config": {
                        "test_type": test_type,
                        "prompt": prompt
                    }
                },
                {
                    "name": "테스트 실행",
                    "type": "task",
                    "task_type": "run_test",
                    "config": {
                        "test_id": "{{test_id}}"
                    }
                },
                {
                    "name": "결과 저장",
                    "type": "task",
                    "task_type": "save_result",
                    "config": {
                        "test_id": "{{test_id}}",
                        "result": "{{result}}"
                    }
                }
            ]
        }
    
    def _update_test_workflow(self, prompt: str, test_type: str) -> Dict:
        """테스트 업데이트 워크플로우
        
        Args:
            prompt: 프롬프트
            test_type: 테스트 유형
            
        Returns:
            Dict: 워크플로우 정의
        """
        return {
            "name": f"{test_type.capitalize()} 테스트 업데이트 워크플로우",
            "description": f"{test_type} 테스트를 업데이트하는 워크플로우",
            "steps": [
                {
                    "name": "테스트 찾기",
                    "type": "task",
                    "task_type": "find_test",
                    "config": {
                        "test_type": test_type,
                        "prompt": prompt
                    }
                },
                {
                    "name": "테스트 업데이트",
                    "type": "task",
                    "task_type": "update_test",
                    "config": {
                        "test_id": "{{test_id}}",
                        "prompt": prompt
                    }
                },
                {
                    "name": "GitHub 업데이트",
                    "type": "task",
                    "task_type": "github_action",
                    "config": {
                        "action": "update",
                        "file_path": "{{file_path}}",
                        "commit_message": f"Update {test_type} test from prompt"
                    }
                }
            ]
        }
    
    def _user_list_workflow(self, prompt: str) -> Dict:
        """사용자 목록 워크플로우
        
        Args:
            prompt: 프롬프트
            
        Returns:
            Dict: 워크플로우 정의
        """
        return {
            "name": "사용자 목록 조회 워크플로우",
            "description": "사용자 목록을 조회하는 워크플로우",
            "steps": [
                {
                    "name": "로그인",
                    "type": "task",
                    "task_type": "login",
                    "config": {
                        "username": "{{username}}",
                        "password": "{{password}}"
                    }
                },
                {
                    "name": "사용자 목록 조회",
                    "type": "task",
                    "task_type": "get_user_list",
                    "config": {
                        "token": "{{token}}"
                    }
                },
                {
                    "name": "결과 저장",
                    "type": "task",
                    "task_type": "save_result",
                    "config": {
                        "result": "{{result}}",
                        "file_path": "user_list_result.json"
                    }
                }
            ]
        }
        
    def _generic_workflow(self, prompt: str, test_type: str) -> Dict:
        """일반 워크플로우
        
        Args:
            prompt: 프롬프트
            test_type: 테스트 유형
            
        Returns:
            Dict: 워크플로우 정의
        """
        return {
            "name": "일반 테스트 워크플로우",
            "description": "프롬프트를 기반으로 테스트 코드를 생성하고 실행하는 워크플로우",
            "steps": [
                {
                    "name": "프롬프트 분석",
                    "type": "task",
                    "task_type": "analyze_prompt",
                    "config": {
                        "prompt": prompt
                    }
                },
                {
                    "name": "테스트 코드 생성",
                    "type": "task",
                    "task_type": "generate_test",
                    "config": {
                        "test_type": test_type,
                        "prompt": prompt
                    }
                }
            ]
        }

# 메인 실행 함수
def analyze_prompt(prompt):
    """프롬프트 분석 함수"""
    context7 = Context7Integration()
    analysis = context7.analyze_prompt(prompt)
    
    print(f"\n프롬프트: {prompt}")
    print(f"분석 결과:")
    print(f"  의도: {analysis['intent']}")
    print(f"  테스트 유형: {analysis['test_type']}")
    print(f"  엔티티: {analysis['entities']}")
    
    return analysis

def convert_to_workflow(prompt):
    """워크플로우 변환 함수"""
    context7 = Context7Integration()
    analysis = context7.analyze_prompt(prompt)
    workflow = context7.convert_to_workflow(prompt, analysis)
    
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

# 명령줄에서 실행 시
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # 명령줄 인수로 프롬프트 받기
        prompt = " ".join(sys.argv[1:])
        
        if "--analyze" in sys.argv:
            prompt = prompt.replace("--analyze", "").strip()
            analyze_prompt(prompt)
        elif "--workflow" in sys.argv:
            prompt = prompt.replace("--workflow", "").strip()
            convert_to_workflow(prompt)
        else:
            # 기본은 분석
            analyze_prompt(prompt)
    else:
        # 인수가 없으면 사용자 입력 받기
        prompt = input("분석할 프롬프트를 입력하세요: ")
        analyze_prompt(prompt)