import os
import sys
import logging
import argparse
from typing import Dict, List, Any, Optional, Union

# 모듈 임포트
from context7_integration import Context7Integration
from context7_test_generator import Context7TestGenerator
from postgresql_integration import PostgreSQLIntegration
from github_integration import GitHubIntegration, save_test_to_github, create_pr_for_test
from workflow_manager import WorkflowManager, UserTemplateManager, create_sample_workflow

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TestCodeGenerationSystem:
    """테스트 코드 생성 시스템
    
    Context7을 사용하여 자연어 명령을 해석하고, 이를 순차적 워크플로우로 변환하여
    조건부 로직(if/else)과 루프를 지원합니다. 모든 워크플로우 정의, 실행 로그 및 사용자 템플릿은
    PostgreSQL 데이터베이스에 저장됩니다. GitHub MCP를 통합하여 이러한 논리적 워크플로우를
    GitHub 저장소 내의 버전 관리 코드로 자동 변환하여 CI/CD 파이프라인 통합을 지원합니다.
    """
    
    def __init__(self, db_config=None, github_config=None):
        """초기화
        
        Args:
            db_config (dict, optional): 데이터베이스 설정
            github_config (dict, optional): GitHub 설정
        """
        # 기본 설정
        self.db_config = db_config or {
            'host': os.environ.get('DB_HOST', 'localhost'),
            'port': os.environ.get('DB_PORT', '5432'),
            'database': os.environ.get('DB_NAME', 'testcode_db'),
            'user': os.environ.get('DB_USER', 'postgres'),
            'password': os.environ.get('DB_PASSWORD', 'postgres')
        }
        
        self.github_config = github_config or {
            'token': os.environ.get('GITHUB_TOKEN'),
            'owner': os.environ.get('GITHUB_OWNER'),
            'repo': os.environ.get('GITHUB_REPO')
        }
        
        # 컴포넌트 초기화
        self.context7 = Context7Integration()
        self.test_generator = Context7TestGenerator(db_config=self.db_config)
        self.db = PostgreSQLIntegration(**self.db_config)
        self.github = GitHubIntegration(**self.github_config)
        self.workflow_manager = WorkflowManager(db_config=self.db_config)
        self.template_manager = UserTemplateManager(db_config=self.db_config)
        
        # 데이터베이스 연결 확인
        self._check_database_connection()
    
    def _check_database_connection(self):
        """데이터베이스 연결 확인"""
        try:
            self.db.connect()
            logger.info("데이터베이스 연결 성공")
        except Exception as e:
            logger.error(f"데이터베이스 연결 실패: {e}")
            raise
    
    def process_prompt(self, prompt: str) -> Dict[str, Any]:
        """프롬프트 처리
        
        Args:
            prompt (str): 자연어 프롬프트
            
        Returns:
            dict: 처리 결과
        """
        logger.info(f"프롬프트 처리 시작: {prompt}")
        
        # 1. Context7을 사용하여 프롬프트 분석
        analysis = self.context7.analyze_prompt(prompt)
        intent = analysis.get('intent')
        test_type = analysis.get('test_type', 'generic')
        entities = analysis.get('entities', {})
        
        logger.info(f"프롬프트 분석 결과: intent={intent}, test_type={test_type}")
        
        # 2. 워크플로우 생성 또는 실행
        if intent == 'create_workflow':
            return self._handle_create_workflow(prompt, test_type, entities)
        elif intent == 'execute_workflow':
            return self._handle_execute_workflow(prompt, entities)
        elif intent == 'update_workflow':
            return self._handle_update_workflow(prompt, entities)
        else:  # 기본: 테스트 코드 생성
            return self._handle_generate_test(prompt, test_type, entities)
    
    def _handle_create_workflow(self, prompt: str, test_type: str, entities: Dict[str, Any]) -> Dict[str, Any]:
        """워크플로우 생성 처리
        
        Args:
            prompt (str): 자연어 프롬프트
            test_type (str): 테스트 유형
            entities (dict): 추출된 엔티티
            
        Returns:
            dict: 처리 결과
        """
        workflow_name = entities.get('workflow_name', f"{test_type}_test_workflow")
        description = entities.get('description', f"{test_type} 테스트를 위한 워크플로우")
        
        # 워크플로우 생성
        workflow_id = self.workflow_manager.create_workflow(workflow_name, description)
        
        # 워크플로우 단계 추가
        steps = self.context7.convert_to_workflow_steps(prompt, test_type)
        for step in steps:
            self.workflow_manager.add_workflow_step(
                workflow_id=workflow_id,
                step_name=step['name'],
                step_type=step['type'],
                step_config=step['config'],
                condition=step.get('condition')
            )
        
        logger.info(f"워크플로우 생성 완료: {workflow_name} (ID: {workflow_id})")
        
        return {
            'status': 'success',
            'message': f"워크플로우 '{workflow_name}'가 생성되었습니다.",
            'workflow_id': workflow_id,
            'workflow_name': workflow_name,
            'steps_count': len(steps)
        }
    
    def _handle_execute_workflow(self, prompt: str, entities: Dict[str, Any]) -> Dict[str, Any]:
        """워크플로우 실행 처리
        
        Args:
            prompt (str): 자연어 프롬프트
            entities (dict): 추출된 엔티티
            
        Returns:
            dict: 처리 결과
        """
        workflow_name = entities.get('workflow_name')
        workflow_id = entities.get('workflow_id')
        
        if not workflow_name and not workflow_id:
            logger.error("워크플로우 이름 또는 ID가 제공되지 않았습니다.")
            return {
                'status': 'error',
                'message': "워크플로우 이름 또는 ID가 필요합니다."
            }
        
        # 워크플로우 ID로 실행
        if workflow_id:
            execution_id = self.workflow_manager.execute_workflow(workflow_id=workflow_id)
        # 워크플로우 이름으로 실행
        else:
            workflow = self.workflow_manager.get_workflow_by_name(workflow_name)
            if not workflow:
                logger.error(f"워크플로우를 찾을 수 없음: {workflow_name}")
                return {
                    'status': 'error',
                    'message': f"워크플로우 '{workflow_name}'를 찾을 수 없습니다."
                }
            execution_id = self.workflow_manager.execute_workflow(workflow_id=workflow['id'])
        
        # 실행 결과 가져오기
        execution = self.workflow_manager.get_workflow_execution(execution_id)
        
        logger.info(f"워크플로우 실행 완료: {execution_id}")
        
        return {
            'status': 'success',
            'message': f"워크플로우가 실행되었습니다.",
            'execution_id': execution_id,
            'execution_status': execution['status'],
            'execution_result': execution['result']
        }
    
    def _handle_update_workflow(self, prompt: str, entities: Dict[str, Any]) -> Dict[str, Any]:
        """워크플로우 업데이트 처리
        
        Args:
            prompt (str): 자연어 프롬프트
            entities (dict): 추출된 엔티티
            
        Returns:
            dict: 처리 결과
        """
        workflow_name = entities.get('workflow_name')
        workflow_id = entities.get('workflow_id')
        
        if not workflow_name and not workflow_id:
            logger.error("워크플로우 이름 또는 ID가 제공되지 않았습니다.")
            return {
                'status': 'error',
                'message': "워크플로우 이름 또는 ID가 필요합니다."
            }
        
        # 워크플로우 가져오기
        if workflow_id:
            workflow = self.workflow_manager.get_workflow(workflow_id)
        else:
            workflow = self.workflow_manager.get_workflow_by_name(workflow_name)
        
        if not workflow:
            logger.error(f"워크플로우를 찾을 수 없음: {workflow_name or workflow_id}")
            return {
                'status': 'error',
                'message': f"워크플로우를 찾을 수 없습니다."
            }
        
        # 업데이트할 필드 추출
        update_fields = {}
        if 'new_name' in entities:
            update_fields['name'] = entities['new_name']
        if 'new_description' in entities:
            update_fields['description'] = entities['new_description']
        
        # 워크플로우 업데이트
        if update_fields:
            self.workflow_manager.update_workflow(workflow['id'], **update_fields)
        
        # 단계 업데이트 처리
        if 'steps' in entities:
            # 기존 단계 삭제
            self.workflow_manager.delete_workflow_steps(workflow['id'])
            
            # 새 단계 추가
            steps = self.context7.convert_to_workflow_steps(prompt, entities.get('test_type', 'generic'))
            for step in steps:
                self.workflow_manager.add_workflow_step(
                    workflow_id=workflow['id'],
                    step_name=step['name'],
                    step_type=step['type'],
                    step_config=step['config'],
                    condition=step.get('condition')
                )
        
        logger.info(f"워크플로우 업데이트 완료: {workflow['id']}")
        
        return {
            'status': 'success',
            'message': f"워크플로우가 업데이트되었습니다.",
            'workflow_id': workflow['id'],
            'updated_fields': list(update_fields.keys()),
            'steps_updated': 'steps' in entities
        }
    
    def _handle_generate_test(self, prompt: str, test_type: str, entities: Dict[str, Any]) -> Dict[str, Any]:
        """테스트 코드 생성 처리
        
        Args:
            prompt (str): 자연어 프롬프트
            test_type (str): 테스트 유형
            entities (dict): 추출된 엔티티
            
        Returns:
            dict: 처리 결과
        """
        # 테스트 코드 생성
        test_code = self.test_generator.generate_test_code(prompt, test_type)
        
        # 데이터베이스에 저장
        test_id = self.test_generator.save_test_to_db(test_code, test_type, prompt)
        
        # GitHub에 저장 (선택적)
        github_result = None
        if entities.get('save_to_github', True):
            try:
                github_result = save_test_to_github(test_code, test_type, prompt)
            except Exception as e:
                logger.error(f"GitHub 저장 실패: {e}")
                github_result = {'error': str(e)}
        
        # PR 생성 (선택적)
        pr_result = None
        if entities.get('create_pr', False):
            try:
                pr_result = create_pr_for_test(test_code, test_type, prompt)
            except Exception as e:
                logger.error(f"PR 생성 실패: {e}")
                pr_result = {'error': str(e)}
        
        logger.info(f"테스트 코드 생성 완료: {test_id}")
        
        return {
            'status': 'success',
            'message': f"{test_type} 테스트 코드가 생성되었습니다.",
            'test_id': test_id,
            'test_type': test_type,
            'test_code': test_code[:100] + '...' if len(test_code) > 100 else test_code,
            'github_result': github_result,
            'pr_result': pr_result
        }
    
    def create_user_template(self, name: str, description: str, content: str) -> Dict[str, Any]:
        """사용자 템플릿 생성
        
        Args:
            name (str): 템플릿 이름
            description (str): 템플릿 설명
            content (str): 템플릿 내용
            
        Returns:
            dict: 생성 결과
        """
        template_id = self.template_manager.create_template(name, description, content)
        
        logger.info(f"사용자 템플릿 생성 완료: {name} (ID: {template_id})")
        
        return {
            'status': 'success',
            'message': f"템플릿 '{name}'이 생성되었습니다.",
            'template_id': template_id,
            'template_name': name
        }
    
    def get_user_templates(self) -> List[Dict[str, Any]]:
        """사용자 템플릿 목록 가져오기
        
        Returns:
            list: 템플릿 목록
        """
        return self.template_manager.get_templates()
    
    def get_workflows(self) -> List[Dict[str, Any]]:
        """워크플로우 목록 가져오기
        
        Returns:
            list: 워크플로우 목록
        """
        return self.workflow_manager.get_workflows()
    
    def get_test_codes(self, test_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """테스트 코드 목록 가져오기
        
        Args:
            test_type (str, optional): 테스트 유형으로 필터링
            
        Returns:
            list: 테스트 코드 목록
        """
        return self.test_generator.get_tests_from_db(test_type)

# 명령줄 인터페이스
def main():
    """명령줄 인터페이스"""
    parser = argparse.ArgumentParser(description="테스트 코드 생성 시스템")
    subparsers = parser.add_subparsers(dest="command", help="명령")
    
    # 프롬프트 처리 명령
    prompt_parser = subparsers.add_parser("prompt", help="프롬프트 처리")
    prompt_parser.add_argument("text", help="자연어 프롬프트")
    
    # 워크플로우 명령
    workflow_parser = subparsers.add_parser("workflow", help="워크플로우 관리")
    workflow_subparsers = workflow_parser.add_subparsers(dest="workflow_command", help="워크플로우 명령")
    
    # 워크플로우 목록
    workflow_subparsers.add_parser("list", help="워크플로우 목록 조회")
    
    # 워크플로우 실행
    workflow_execute_parser = workflow_subparsers.add_parser("execute", help="워크플로우 실행")
    workflow_execute_parser.add_argument("--id", help="워크플로우 ID")
    workflow_execute_parser.add_argument("--name", help="워크플로우 이름")
    
    # 워크플로우 삭제
    workflow_delete_parser = workflow_subparsers.add_parser("delete", help="워크플로우 삭제")
    workflow_delete_parser.add_argument("--id", help="워크플로우 ID")
    workflow_delete_parser.add_argument("--name", help="워크플로우 이름")
    
    # 템플릿 명령
    template_parser = subparsers.add_parser("template", help="템플릿 관리")
    template_subparsers = template_parser.add_subparsers(dest="template_command", help="템플릿 명령")
    
    # 템플릿 목록
    template_subparsers.add_parser("list", help="템플릿 목록 조회")
    
    # 템플릿 생성
    template_create_parser = template_subparsers.add_parser("create", help="템플릿 생성")
    template_create_parser.add_argument("--name", required=True, help="템플릿 이름")
    template_create_parser.add_argument("--description", help="템플릿 설명")
    template_create_parser.add_argument("--file", help="템플릿 파일 경로")
    template_create_parser.add_argument("--content", help="템플릿 내용")
    
    # 테스트 명령
    test_parser = subparsers.add_parser("test", help="테스트 관리")
    test_subparsers = test_parser.add_subparsers(dest="test_command", help="테스트 명령")
    
    # 테스트 목록
    test_list_parser = test_subparsers.add_parser("list", help="테스트 목록 조회")
    test_list_parser.add_argument("--type", help="테스트 유형")
    
    # 테스트 생성
    test_create_parser = test_subparsers.add_parser("create", help="테스트 생성")
    test_create_parser.add_argument("--prompt", required=True, help="자연어 프롬프트")
    test_create_parser.add_argument("--type", default="generic", help="테스트 유형")
    test_create_parser.add_argument("--github", action="store_true", help="GitHub에 저장")
    test_create_parser.add_argument("--pr", action="store_true", help="PR 생성")
    
    # 초기화 명령
    init_parser = subparsers.add_parser("init", help="시스템 초기화")
    init_parser.add_argument("--sample", action="store_true", help="샘플 워크플로우 생성")
    
    args = parser.parse_args()
    
    # 시스템 인스턴스 생성
    system = TestCodeGenerationSystem()
    
    # 명령 처리
    if args.command == "prompt":
        result = system.process_prompt(args.text)
        print(f"프롬프트 처리 결과: {result}")
    
    elif args.command == "workflow":
        if args.workflow_command == "list":
            workflows = system.get_workflows()
            print(f"워크플로우 목록 ({len(workflows)}개):")
            for wf in workflows:
                print(f"  - {wf['id']}: {wf['name']} ({wf['description']})")
        
        elif args.workflow_command == "execute":
            if not args.id and not args.name:
                print("워크플로우 ID 또는 이름이 필요합니다.")
                sys.exit(1)
            
            if args.id:
                execution_id = system.workflow_manager.execute_workflow(workflow_id=args.id)
            else:
                workflow = system.workflow_manager.get_workflow_by_name(args.name)
                if not workflow:
                    print(f"워크플로우를 찾을 수 없음: {args.name}")
                    sys.exit(1)
                execution_id = system.workflow_manager.execute_workflow(workflow_id=workflow['id'])
            
            execution = system.workflow_manager.get_workflow_execution(execution_id)
            print(f"워크플로우 실행 완료: {execution_id}")
            print(f"상태: {execution['status']}")
            print(f"결과: {execution['result']}")
        
        elif args.workflow_command == "delete":
            if not args.id and not args.name:
                print("워크플로우 ID 또는 이름이 필요합니다.")
                sys.exit(1)
            
            if args.id:
                system.workflow_manager.delete_workflow(args.id)
                print(f"워크플로우 삭제 완료: ID {args.id}")
            else:
                workflow = system.workflow_manager.get_workflow_by_name(args.name)
                if not workflow:
                    print(f"워크플로우를 찾을 수 없음: {args.name}")
                    sys.exit(1)
                system.workflow_manager.delete_workflow(workflow['id'])
                print(f"워크플로우 삭제 완료: {args.name}")
    
    elif args.command == "template":
        if args.template_command == "list":
            templates = system.get_user_templates()
            print(f"템플릿 목록 ({len(templates)}개):")
            for tpl in templates:
                print(f"  - {tpl['id']}: {tpl['name']} ({tpl['description']})")
        
        elif args.template_command == "create":
            if not args.file and not args.content:
                print("템플릿 파일 또는 내용이 필요합니다.")
                sys.exit(1)
            
            content = args.content
            if args.file:
                with open(args.file, "r") as f:
                    content = f.read()
            
            result = system.create_user_template(
                name=args.name,
                description=args.description or f"템플릿: {args.name}",
                content=content
            )
            
            print(f"템플릿 생성 완료: {result['template_id']}")
    
    elif args.command == "test":
        if args.test_command == "list":
            tests = system.get_test_codes(args.type)
            print(f"테스트 코드 목록 ({len(tests)}개):")
            for test in tests:
                print(f"  - {test['id']}: {test['test_type']} ({test['created_at']})")
        
        elif args.test_command == "create":
            entities = {
                'save_to_github': args.github,
                'create_pr': args.pr
            }
            
            result = system._handle_generate_test(args.prompt, args.type, entities)
            
            print(f"테스트 생성 완료: {result['test_id']}")
            print(f"테스트 유형: {result['test_type']}")
            if args.github and 'github_result' in result and result['github_result']:
                if 'error' in result['github_result']:
                    print(f"GitHub 저장 실패: {result['github_result']['error']}")
                else:
                    print(f"GitHub 저장 완료: {result['github_result'].get('file_path', 'N/A')}")
            
            if args.pr and 'pr_result' in result and result['pr_result']:
                if 'error' in result['pr_result']:
                    print(f"PR 생성 실패: {result['pr_result']['error']}")
                else:
                    print(f"PR 생성 완료: {result['pr_result'].get('html_url', 'N/A')}")
    
    elif args.command == "init":
        # 데이터베이스 초기화
        system.db.initialize_database()
        print("데이터베이스 초기화 완료")
        
        if args.sample:
            # 샘플 워크플로우 생성
            workflow_id = create_sample_workflow(system.workflow_manager)
            print(f"샘플 워크플로우 생성 완료: {workflow_id}")

if __name__ == "__main__":
    main()